import { Injectable } from '@angular/core';
import { createClient, PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  public hotels: any[] = [];
  setHotels(hotels: any[]): void {
    this.hotels = hotels;
  }
  getHotels(): any[] {
    return this.hotels;
  }

  constructor() {
    this.supabase = createClient(
      'https://rpxplyjzuirgbeurdfeq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJweHBseWp6dWlyZ2JldXJkZmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NDQ5MjMsImV4cCI6MjA1NDMyMDkyM30.WfdyM20lDqTo5PTBf-dTrv4xKwiXGOw7n9mZl1GNc1o'
    );
  }

  async signUp(email: string, password: string, fullName: any) {
    return await this.supabase.auth.signUp({ 
      email, 
      password, 
      options:{
        data: { 
          display_name: fullName,
          emailRedirectTo: null, // ⬅️ Disable email verification for testing
        }
      }   
    });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  // Fetch all locations
  getLocations(): Observable<any[]> {
    return from(this.supabase.from('Locations').select('*')).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        return response.data || []; // Extract 'data' and return as object
      })
    )
  }

  // Fetch all hotels
  getAllHotels(): Observable<any[]> {
    return from(this.supabase.from('Hotels').select('*')).pipe(
      map((response: PostgrestSingleResponse<any[]>) => {
        if (response.error) {
          throw response.error;
        }
        return response.data || []; // Extract 'data' and return as array
      })
    );
  }

  async getAvailableHotels(place: string, startDate: string, endDate: string, guests: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_available_hotels', {
        place,
        start_date: startDate,
        end_date: endDate,
        guests,
      });
  
      if (error) {
        console.error('Supabase error:', error.message);
        throw new Error(error.message);
      }
  
      return data || []; // Ensure the function always returns an array
    } catch (error) {
      console.error('Error in RPC call:', error);
      throw error;
    }
  }
  
  

}
