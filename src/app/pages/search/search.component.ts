import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { SearchFilterService } from 'src/app/service/search-filter.service';
import { SupabaseService } from 'src/app/service/supabase.service';
import { BookingPopupComponent } from '../booking-popup/booking-popup.component';
import { MatDialog } from '@angular/material/dialog';

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

  maxPriceHotel: number = 6000;
  minPriceHotel: number = 0;
  selectedMaxPrice: number = 6000; // Default max price selected

  totalAmenities = ['wifi', 'pool', 'parking', 'breakfast']; 
  selectedAmenities: string[] = []; 

  cityControl = new FormControl('');
  filteredCities$: Observable<string[]> = of([]);


  constructor(private supabase: SupabaseService, private searchFilter: SearchFilterService, public dialog: MatDialog) {
  }


  ngOnInit(): void {
    // Load filters from localStorage
    const storedFilters = this.searchFilter.getFilters();
    this.searchLocation = storedFilters.searchLocation || '';
    this.checkinDate = storedFilters.checkinDate || '';
    this.checkoutDate = storedFilters.checkoutDate || '';
    this.guests = storedFilters.guests || 1;

    this.filteredCities$ = this.cityControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Delay to prevent too many API calls
      distinctUntilChanged(),
      switchMap(value => this.filterLocations(value || ''))
    );

    // console.log('Loaded filters:', storedFilters);

    this.searchFilter.fetchAvailableHotels();


    // Subscribe to search filters
    this.searchFilter.filters$.pipe(takeUntil(this.destroy$)).subscribe((filters) => {
      this.searchLocation = filters.searchLocation;
      this.checkinDate = filters.checkinDate;
      this.checkoutDate = filters.checkoutDate;
      this.guests = filters.guests;
    });


    // Subscribe to filtered hotels
    this.searchFilter.hotels$.pipe(takeUntil(this.destroy$)).subscribe((hotels) => {
      this.hotels = hotels;
      this.allHotels = hotels; // Keep original list for filtering
      // this.calculatePriceFilter();

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


  filterLocations(value: string): Observable<string[]> {
    return this.supabase.getLocations().pipe(
      map(locations => {
        const filterValue = value.toLowerCase();
        return (locations || [])
          .map(loc => loc.locationName) // Extract only city names
          .filter(city => city.toLowerCase().includes(filterValue));
      })
      
    );
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
    // if (this.selectedAmenities.length === 0) {
    //   this.hotels = this.allHotels; // Reset filters
    //   return;
    // }
  
    this.hotels = this.allHotels.filter(hotel => {
      // Ensure hotelAmenities is always an array
      const amenities = typeof hotel.hotelamenities === 'string' 
        ? hotel.hotelAmenities.toLowerCase().split(',') 
        : Array.isArray(hotel.hotelamenities) 
        ? hotel.hotelamenities.map((a: string) => a.toLowerCase()) 
        : [];
  
      // console.log(`Checking Hotel: ${hotel.name}`, "Amenities:", amenities);
  
      // Check selected Filters
      const matchesAmenities = this.selectedAmenities.length === 0 || this.selectedAmenities.some(a => amenities.includes(a));
      const matchesPrice = hotel.lowestprice >= this.minPriceHotel && hotel.lowestprice <= this.selectedMaxPrice;

      return matchesAmenities && matchesPrice;
    });
  
    console.log("Filtered Hotels:", this.hotels);
  }


  calculatePriceFilter() {
    this.filterHotels(); // ✅ Re-apply filtering when price is changed
  }






  openBookingDetails(hotel: any): void {
    this.dialog.open(BookingPopupComponent, {
      width: '800px',
      data: { hotel, searchLocation: this.searchLocation }
    });
  }





}
