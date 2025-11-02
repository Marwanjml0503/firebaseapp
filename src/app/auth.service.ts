import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  authState,
  deleteUser,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  // Sign up with email, password, and username
  async signUp(email: string, password: string, username: string) {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Store user profile in Firestore
      await setDoc(doc(this.firestore, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  // Sign in with email/password
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Update last login time in Firestore
      await setDoc(doc(this.firestore, 'users', user.uid), {
        lastLogin: new Date()
      }, { merge: true });
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw error;
    }
  }

  // Get current user with username - RELIABLE VERSION
  getCurrentUser(): Observable<any> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          return new Observable(subscriber => {
            // Small delay to ensure Firestore is ready
            setTimeout(() => {
              this.loadUserData(user.uid, user.email!)
                .then(userData => {
                  subscriber.next(userData);
                  subscriber.complete();
                })
                .catch(error => {
                  console.error('Error loading user data:', error);
                  // Fallback user data
                  subscriber.next({
                    uid: user.uid,
                    email: user.email,
                    username: user.email?.split('@')[0] || 'user',
                    createdAt: new Date(),
                    lastLogin: new Date()
                  });
                  subscriber.complete();
                });
            }, 100);
          });
        } else {
          return of(null);
        }
      }),
      catchError(error => {
        console.error('Error in user observable:', error);
        return of(null);
      })
    );
  }

  // Helper method to load user data with retry
  private async loadUserData(uid: string, email: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: uid,
          email: email,
          username: userData['username'],
          createdAt: userData['createdAt'],
          lastLogin: userData['lastLogin']
        };
      } else {
        // If no user document exists, create one and retry
        console.log('User document not found, creating one...');
        await this.createUserDocument(uid, email, email.split('@')[0]);
        
        // Retry after creating the document
        const retryDoc = await getDoc(doc(this.firestore, 'users', uid));
        if (retryDoc.exists()) {
          const userData = retryDoc.data();
          return {
            uid: uid,
            email: email,
            username: userData['username'],
            createdAt: userData['createdAt'],
            lastLogin: userData['lastLogin']
          };
        } else {
          // Final fallback
          return {
            uid: uid,
            email: email,
            username: email.split('@')[0],
            createdAt: new Date(),
            lastLogin: new Date()
          };
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // Helper method to create user document
  private async createUserDocument(uid: string, email: string, username: string) {
    try {
      await setDoc(doc(this.firestore, 'users', uid), {
        username: username,
        email: email,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  // Update user profile (username)
  async updateProfile(newUsername: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    await updateDoc(doc(this.firestore, 'users', user.uid), {
      username: newUsername
    });
  }

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  }

  // Delete user account
  async deleteAccount(password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Delete user data from Firestore
    await deleteDoc(doc(this.firestore, 'users', user.uid));
    
    // Delete user from Firebase Auth
    await deleteUser(user);
  }

  // Get user profile by UID
  async getUserProfile(uid: string): Promise<any> {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  }
}