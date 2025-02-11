import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { SearchFilterService } from 'src/app/service/search-filter.service';
import { SupabaseService } from 'src/app/service/supabase.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy  {
  hotels: any[] = []; // Add this line to store data locally
  allHotels: any[] = [];
  searchLocation: string = '';
  checkinDate: string = '';
  checkoutDate: string = '';
  guests: number = 1;

  totalAmenities = ['wifi', 'pool', 'parking', 'breakfast']; 
  selectedAmenities: string[] = []; 

  constructor(private supabase: SupabaseService, private searchFilter: SearchFilterService) {
  }

  ngOnInit(): void {
    // Load filters from localStorage
    const storedFilters = this.searchFilter.getFilters();
    this.searchLocation = storedFilters.searchLocation;
    this.checkinDate = storedFilters.checkinDate;
    this.checkoutDate = storedFilters.checkoutDate;
    this.guests = storedFilters.guests;

    // console.log('Loaded filters:', storedFilters);

    this.searchFilter.fetchAvailableHotels();

    // Subscribe to search filters
    this.searchFilter.filters$.subscribe((filters) => {
      this.searchLocation = filters.searchLocation;
      this.checkinDate = filters.checkinDate;
      this.checkoutDate = filters.checkoutDate;
      this.guests = filters.guests;
    });


    // Subscribe to filtered hotels
    this.searchFilter.hotels$.subscribe((hotels) => {
      this.hotels = hotels;
      this.allHotels = hotels; // Keep original list for filtering
    });

    
    // Debounced filter update
    this.filterUpdateSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(( ) => {
        this.searchFilter.updateFilters({
          searchLocation: this.searchLocation,
          checkinDate: this.checkinDate,
          checkoutDate: this.checkoutDate,
          guests: this.guests
      });
    });





  }






  //////////////////////////////////////////////
  private filterUpdateSubject = new Subject<string>(); // Subject to trigger debounced updates
  private destroy$ = new Subject<void>(); // To prevent memory leaks

  // ✅ Optimized function: Triggers debounced update
  updateFilters(): void {
    const filterString = JSON.stringify({
      searchLocation: this.searchLocation,
      checkinDate: this.checkinDate,
      checkoutDate: this.checkoutDate,
      guests: this.guests,
      selectedAmenities: this.selectedAmenities
    });
    this.filterUpdateSubject.next(filterString);
    // console.log(this.hotels);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ////////////////////////////////////////////





  // Toggle selected filters
  toggleAmenityFilter(amenity: string, event: any) {
    if (event.target.checked) {
      this.selectedAmenities.push(amenity);
    } else {
      this.selectedAmenities = this.selectedAmenities.filter(a => a !== amenity);
    }
    this.filterHotels();
  }

  // Function to filter hotels dynamically
  filterHotels() {
    if (this.selectedAmenities.length === 0) {
      this.hotels = this.allHotels; // Reset filters
      return;
    }
  
    this.hotels = this.allHotels.filter(hotel => {
      // Ensure hotelAmenities is always an array
      const amenities = typeof hotel.hotelamenities === 'string' 
        ? hotel.hotelAmenities.toLowerCase().split(',') 
        : Array.isArray(hotel.hotelamenities) 
          ? hotel.hotelamenities.map((a: string) => a.toLowerCase()) 
          : [];
  
      console.log(`Checking Hotel: ${hotel.name}`, "Amenities:", amenities);
  
      // Return true if at least one selected amenity is present in hotelAmenities
      return this.selectedAmenities.some(a => amenities.includes(a));
    });
  
    console.log("Filtered Hotels:", this.hotels);
  }


}
