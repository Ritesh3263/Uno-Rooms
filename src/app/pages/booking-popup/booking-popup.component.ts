import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-booking-popup',
  templateUrl: './booking-popup.component.html',
  styleUrls: ['./booking-popup.component.scss']
})
export class BookingPopupComponent {
  selectedRoom: any = null;

  constructor( public dialogRef: MatDialogRef<BookingPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    // Add isSelected property dynamically to each room
    this.data.hotel.rooms = this.data.hotel.rooms.map((room: any) => ({
      ...room,
      isSelected: false
    }));

  }



  toggleSelection(selectedRoom: any): void {
    // First, deselect all rooms
    this.data.hotel.rooms.forEach((room: any) => room.isSelected = false);

    selectedRoom.isSelected = !selectedRoom.isSelected;

    this.selectedRoom = selectedRoom;

  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}
