import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {

  private filtersSubject = new BehaviorSubject<any>(this.getStoredFilters());
  private hotelsSubject = new BehaviorSubject<any[]>([]);
  
  filters$ = this.filtersSubject.asObservable();
  hotels$ = this.hotelsSubject.asObservable();  
  
  constructor(private supabaseService: SupabaseService) { }

  updateFilters(newFilters: any) {
    this.filtersSubject.next(newFilters);
    localStorage.setItem('searchFilters', JSON.stringify(newFilters));
    this.fetchAvailableHotels();
  }

  getFilters() {
    return this.filtersSubject.getValue();
  }

  async fetchAvailableHotels() {
    const filters = this.getFilters();
    const hotels = await this.supabaseService.getAvailableHotels(
      filters.searchLocation, filters.checkinDate, filters.checkoutDate, filters.guests
    );
    this.hotelsSubject.next(hotels);  // Update hotels observable
    // console.log('Fetched available hotels:', hotels);  // Log fetched hotels for debugging purposes
  }

  private getStoredFilters() {
    const savedFilters = localStorage.getItem('searchFilters');
    if (savedFilters) {
      try{
        let parsedFilters = JSON.parse(savedFilters);

        // ✅ Ensure dates are properly formatted
        return {
          searchLocation: parsedFilters.searchLocation || '',
          checkinDate: parsedFilters.checkinDate ? new Date(parsedFilters.checkinDate).toISOString().split('T')[0] : '',
          checkoutDate: parsedFilters.checkoutDate ? new Date(parsedFilters.checkoutDate).toISOString().split('T')[0] : '',
          guests: parsedFilters.guests ? Number(parsedFilters.guests) : 1
        };
      }catch (error) {
        console.error('Error parsing stored filters:', error);
        return this.getDefaultFilters(); // Return default if JSON parsing fails
      }
    }
    return this.getDefaultFilters();  
      
    }
    private getDefaultFilters() {
      return {
        searchLocation: '',
        checkinDate: '',
        checkoutDate: '',
        guests: 1
    };
  }
  
}
