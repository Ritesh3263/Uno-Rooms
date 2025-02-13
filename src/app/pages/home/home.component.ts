import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchFilterService } from 'src/app/service/search-filter.service';
import { SupabaseService } from 'src/app/service/supabase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // hotels: any[] = [];
  locations: any[] = [];
  cities: string[] = [];
  selectedCity: string = "";
  dateFrom: Date | null = null;
  selectedDateFrom: string = '';
  dateTo: Date | null = null;
  selectedDateTo: string = '';
  selectedGuest: number = 1;




  constructor(private router: Router, private supabaseService: SupabaseService, private searchFilter: SearchFilterService){}

  ngOnInit(): void {
    // this.fetchAllHotels();
    this.fetchLocations();
    // console.log(this.locations);
    // console.log(this.cities);
    // this.searchHotels('Pune', '202-01-01', '2022-01-31', 2);
  }


  
  // fetchAllHotels(){
  //   this.supabaseService.getAllHotels().subscribe({
  //     next: (hotels) => {
  //       this.hotels = hotels;
  //       // console.log('Hotels:', hotels);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching hotels:', error);
  //     }
  //   });
  // }

  // Format date on realtime
  updateSelectedDates(event: any, type: string) {
    if (event && event.value) {
      const formattedDate = event.value.toISOString().split('T')[0]; // Format YYYY-MM-DD
      if (type === 'from') {
        this.selectedDateFrom = formattedDate;
      } else {
        this.selectedDateTo = formattedDate;
      }
    }
    // console.log('Updated Dates:', this.selectedDateFrom, this.selectedDateTo);
  }


  // searchHotels(place: string, startDate: string, endDate: string, guests: number) {

  //   this.supabaseService.getAvailableHotels(this.selectedCity, this.selectedDateFrom, this.selectedDateTo, this.selectedGuest).then((hotels) => {
  //     this.hotels = hotels;
  //     // console.log('Available Hotels:', this.hotels);

  //     this.router.navigate(['/search-result'], { state: { hotels: this.hotels } }); // Navigate to the new component and pass data

  //   }).catch((error: any) => {
  //     console.error('Error:', error);
  //   });
  //   // console.log('selected data :', this.selectedCity, this.selectedDateFrom, this.selectedDateTo, this.selectedGuest);
  //   console.log("hotels available : ", this.hotels);
  // }

  fetchLocations(){
    this.supabaseService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.cities = locations.map((location: any) => location.locationName);
        // console.log('Extracted Cities:', this.cities);
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      }
    });
  }

  onclickSearch(): void{

    this.searchFilter.updateFilters({
      searchLocation: this.selectedCity,
      checkinDate: this.selectedDateFrom,
      checkoutDate: this.selectedDateTo,
      guests: this.selectedGuest
    });
    this.router.navigate(['/search-result']);
  }

  //   const filters = { 
  //     searchLocation: this.selectedCity, 
  //     checkinDate: this.selectedDateFrom, 
  //     checkoutDate: this.selectedDateTo, 
  //     guests: this.selectedGuest
  //   };

  //   this.searchFilter.updateFilters(filters);


  //   this.supabaseService.getAvailableHotels(this.selectedCity, this.selectedDateFrom, this.selectedDateTo, this.selectedGuest).then((hotels) => {
  //     // console.log('Available hotels:', hotels); // ✅ Debugging step

  //     this.supabaseService.setHotels(hotels);
  //     this.router.navigate(['/search-result'], { queryParams: { filters } });
  //     // this.router.navigate(['/search-result'], { state: { hotels: hotels } }); // Navigate to the new component and pass data
  //     // console.log('Available Hotels:', hotels);
  //   }).catch((error: any) => {
  //     console.error('Error:', error);
  //   });
  // }

}
