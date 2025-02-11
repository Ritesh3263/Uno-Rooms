import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/service/supabase.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {


  loggedUserData: any; 

  dateRangeForm = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  constructor(private supabaseService: SupabaseService,private router: Router) {
    const session = localStorage.getItem('supabaseSession');
    if (session != null) {
      this.loggedUserData = JSON.parse(session);
    }
    // console.log(this.loggedUserData.user.user_metadata.display_name.split(' ')[0]);
  }


  async logoutUser() {
    await this.supabaseService.signOut();
    localStorage.removeItem('supabaseSession'); // Clear session storage
    this.loggedUserData = null;  // Clear user data from local storage and component state
    this.router.navigate(['/login']);
  }



}
