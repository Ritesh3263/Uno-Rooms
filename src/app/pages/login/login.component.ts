import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/service/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isRegistered = false;
  email: string = '';
  password: string = '';
  fullName: string = '';
  message: string = '';
  isLoading: boolean = false;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  ngOnInit() {
    const session = localStorage.getItem('supabaseSession');
    if (session) {
      this.router.navigate(['/home']); // Auto-login if session exists
    }
  }
  

  async registerUser() {
    this.isLoading = true;
    try {
      const { data, error } = await this.supabaseService.signUp(
        this.email, 
        this.password, 
        this.fullName 
      );
      if (error) throw error;
      this.message = 'Sign-up successful! Check your email for verification.';
      console.log(this.message);
      this.router.navigateByUrl('/home');
      // Store session data (user stays logged in)
      localStorage.setItem('supabaseSession', JSON.stringify(data.session));
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.message = error.message;  
      } else {
        this.message = 'An unknown error occurred';
      }
    }finally {
      this.isLoading = false; 
    }
  }


  async loginUser() {
    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService.signIn(this.email, this.password);
      if (error) throw error;
      
      // Store session data (user stays logged in)
      localStorage.setItem('supabaseSession', JSON.stringify(data.session));
      
      this.message = 'Login successful!';
      this.router.navigate(['/home']); // Redirect after login
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.message = error.message;  
      } else {
        this.message = 'An unknown error occurred';
      }
    }finally {
      this.isLoading = false; 
    }
  }




}
