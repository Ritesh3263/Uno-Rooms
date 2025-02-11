import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { NewBookingComponent } from './pages/new-booking/new-booking.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { BookingCalenderComponent } from './pages/booking-calender/booking-calender.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    children:[
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'search-result',
        component: SearchComponent
      },
      {
        path: 'newBooking',
        component: NewBookingComponent
      },
      {
        path: 'bookings',
        component: BookingsComponent
      },
      {
        path: 'booking-calender',
        component: BookingCalenderComponent
      }
    ]
      
    
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
