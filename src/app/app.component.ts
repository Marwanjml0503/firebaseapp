import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.component.css'], 
  template: `
    <div class="container">
      <h1>Welcome to Auth App</h1>
      
      <div *ngIf="user$ | async as user; else loginRegister">
        <div *ngIf="user">
          <div class="welcome-section">
            <h3>Welcome, {{ user.username }}! 👋</h3>
            <div class="user-info">
              <p><strong>Username:</strong> {{ user.username }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>User ID:</strong> {{ user.uid }}</p>
              <p *ngIf="user.createdAt"><strong>Member since:</strong> {{ user.createdAt.toDate() | date:'mediumDate' }}</p>
              <p *ngIf="user.lastLogin"><strong>Last login:</strong> {{ user.lastLogin.toDate() | date:'medium' }}</p>
            </div>
            
            <div class="profile-actions">
              <button (click)="showEditProfile = true" class="btn-primary">Edit Profile</button>
              <button (click)="showChangePassword = true" class="btn-secondary">Change Password</button>
              <button (click)="showDeleteAccount = true" class="btn-danger">Delete Account</button>
              <button (click)="signOut()" class="logout-btn">Sign Out</button>
            </div>
          </div>

          <!-- Edit Profile Modal -->
          <div *ngIf="showEditProfile" class="modal-overlay">
            <div class="modal">
              <h3>Edit Profile</h3>
              <form (ngSubmit)="onUpdateProfile()" #editProfileForm="ngForm">
                <div class="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editUsername" 
                    name="editUsername"
                    [value]="user.username"
                    required
                    minlength="3"
                  >
                </div>
                <div class="modal-actions">
                  <button type="button" (click)="showEditProfile = false" class="btn-secondary">Cancel</button>
                  <button type="submit" [disabled]="!editProfileForm.form.valid" class="btn-primary">Save Changes</button>
                </div>
              </form>
              <p *ngIf="profileUpdateError" class="error">{{ profileUpdateError }}</p>
              <p *ngIf="profileUpdateSuccess" class="success">{{ profileUpdateSuccess }}</p>
            </div>
          </div>

          <!-- Change Password Modal -->
          <div *ngIf="showChangePassword" class="modal-overlay">
            <div class="modal">
              <h3>Change Password</h3>
              <form (ngSubmit)="onChangePassword()" #changePasswordForm="ngForm">
                <div class="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    [(ngModel)]="currentPassword" 
                    name="currentPassword"
                    required
                  >
                </div>
                <div class="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    [(ngModel)]="newPassword" 
                    name="newPassword"
                    required
                    minlength="6"
                  >
                </div>
                <div class="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    [(ngModel)]="confirmPassword" 
                    name="confirmPassword"
                    required
                  >
                </div>
                <div class="modal-actions">
                  <button type="button" (click)="showChangePassword = false" class="btn-secondary">Cancel</button>
                  <button type="submit" [disabled]="!changePasswordForm.form.valid" class="btn-primary">Update Password</button>
                </div>
              </form>
              <p *ngIf="passwordError" class="error">{{ passwordError }}</p>
              <p *ngIf="passwordSuccess" class="success">{{ passwordSuccess }}</p>
            </div>
          </div>

          <!-- Delete Account Modal -->
          <div *ngIf="showDeleteAccount" class="modal-overlay">
            <div class="modal">
              <h3>Delete Account</h3>
              <p class="warning-text">⚠️ This action cannot be undone. All your data will be permanently deleted.</p>
              <form (ngSubmit)="onDeleteAccount()" #deleteAccountForm="ngForm">
                <div class="form-group">
                  <label>Enter your password to confirm:</label>
                  <input 
                    type="password" 
                    [(ngModel)]="deletePassword" 
                    name="deletePassword"
                    required
                  >
                </div>
                <div class="modal-actions">
                  <button type="button" (click)="showDeleteAccount = false" class="btn-secondary">Cancel</button>
                  <button type="submit" [disabled]="!deleteAccountForm.form.valid" class="btn-danger">Delete My Account</button>
                </div>
              </form>
              <p *ngIf="deleteError" class="error">{{ deleteError }}</p>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loginRegister>
        <!-- Your existing login/register forms here -->
        <div class="auth-container">
          <!-- Login Form -->
          <div class="form-section">
            <h2>Login</h2>
            <form (ngSubmit)="onLogin()" #loginForm="ngForm">
              <div class="form-group">
                <input 
                  type="email" 
                  [(ngModel)]="loginEmail" 
                  name="loginEmail"
                  placeholder="Email address" 
                  required
                >
              </div>
              <div class="form-group">
                <input 
                  type="password" 
                  [(ngModel)]="loginPassword" 
                  name="loginPassword"
                  placeholder="Password" 
                  required
                >
              </div>
              <button type="submit" [disabled]="!loginForm.form.valid">Login</button>
            </form>
            <p *ngIf="loginError" class="error">{{ loginError }}</p>
          </div>

          <!-- Register Form -->
          <div class="form-section">
            <h2>Create Account</h2>
            <form (ngSubmit)="onRegister()" #registerForm="ngForm">
              <div class="form-group">
                <input 
                  type="text" 
                  [(ngModel)]="registerUsername" 
                  name="registerUsername"
                  placeholder="Choose a username" 
                  required
                  minlength="3"
                >
                <small>Minimum 3 characters</small>
              </div>
              <div class="form-group">
                <input 
                  type="email" 
                  [(ngModel)]="registerEmail" 
                  name="registerEmail"
                  placeholder="Email address" 
                  required
                >
              </div>
              <div class="form-group">
                <input 
                  type="password" 
                  [(ngModel)]="registerPassword" 
                  name="registerPassword"
                  placeholder="Create password" 
                  required
                  minlength="6"
                >
                <small>Minimum 6 characters</small>
              </div>
              <button type="submit" [disabled]="!registerForm.form.valid">Create Account</button>
            </form>
            <p *ngIf="registerError" class="error">{{ registerError }}</p>
            <p *ngIf="registerSuccess" class="success">{{ registerSuccess }}</p>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    /* Your existing styles... */

    .profile-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-danger {
      background-color: #e74c3c;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-primary:hover { background-color: #2980b9; }
    .btn-secondary:hover { background-color: #7f8c8d; }
    .btn-danger:hover { background-color: #c0392b; }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      padding: 30px;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .modal h3 {
      margin-top: 0;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .warning-text {
      color: #e74c3c;
      background: #fdf2f2;
      padding: 10px;
      border-radius: 6px;
      border-left: 4px solid #e74c3c;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #2c3e50;
    }
  `]
})

export class AppComponent {
  user$: Observable<any>;
  
  // Login form fields
  loginEmail: string = '';
  loginPassword: string = '';
  loginError: string = '';
  
  // Register form fields
  registerUsername: string = '';
  registerEmail: string = '';
  registerPassword: string = '';
  registerError: string = '';
  registerSuccess: string = '';

  // Profile management
  showEditProfile: boolean = false;
  showChangePassword: boolean = false;
  showDeleteAccount: boolean = false;
  
  editUsername: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  deletePassword: string = '';
  
  profileUpdateError: string = '';
  profileUpdateSuccess: string = '';
  passwordError: string = '';
  passwordSuccess: string = '';
  deleteError: string = '';

  constructor(private authService: AuthService) {
    this.user$ = this.authService.getCurrentUser();
  }

  async onLogin() {
    try {
      this.loginError = '';
      await this.authService.signIn(this.loginEmail, this.loginPassword);
      this.loginEmail = '';
      this.loginPassword = '';
    } catch (error: any) {
      this.loginError = this.getErrorMessage(error);
    }
  }

  async onRegister() {
    try {
      this.registerError = '';
      this.registerSuccess = '';
      await this.authService.signUp(this.registerEmail, this.registerPassword, this.registerUsername);
      this.registerSuccess = 'Account created successfully! You can now login.';
      this.registerUsername = '';
      this.registerEmail = '';
      this.registerPassword = '';
    } catch (error: any) {
      this.registerError = this.getErrorMessage(error);
    }
  }

  async onUpdateProfile() {
    try {
      this.profileUpdateError = '';
      this.profileUpdateSuccess = '';
      
      await this.authService.updateProfile(this.editUsername);
      this.profileUpdateSuccess = 'Profile updated successfully!';
      this.showEditProfile = false;
      this.editUsername = '';
      
      // Refresh user data
      setTimeout(() => {
        // Force refresh by reassigning the observable
        this.user$ = this.authService.getCurrentUser();
      }, 1000);
      
    } catch (error: any) {
      this.profileUpdateError = this.getErrorMessage(error);
    }
  }

  async onChangePassword() {
    try {
      this.passwordError = '';
      this.passwordSuccess = '';
      
      if (this.newPassword !== this.confirmPassword) {
        this.passwordError = 'New passwords do not match.';
        return;
      }
      
      await this.authService.updatePassword(this.currentPassword, this.newPassword);
      this.passwordSuccess = 'Password updated successfully!';
      
      // Clear form
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      
      setTimeout(() => {
        this.showChangePassword = false;
      }, 2000);
      
    } catch (error: any) {
      this.passwordError = this.getErrorMessage(error);
    }
  }

  async onDeleteAccount() {
    try {
      this.deleteError = '';
      
      await this.authService.deleteAccount(this.deletePassword);
      // User will be automatically signed out and redirected to login page
      
    } catch (error: any) {
      this.deleteError = this.getErrorMessage(error);
    }
  }

  async signOut() {
    try {
      await this.authService.signOut();
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/requires-recent-login':
        return 'Please log in again to perform this action.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
}