import { Component } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-dialog-risque',
  templateUrl: './dialog-risque.component.html',
  standalone: true,
  imports: [
    CommonModule,          // pour *ngFor, *ngIf...
    MatDialogModule,       // pour <mat-dialog-content>, <mat-dialog-actions>
    MatDividerModule,      // pour <mat-divider>
    MatButtonModule        // si tu utilises <button mat-button>
  ],
  styleUrls: ['./dialog-risque.component.scss']
})
export class DialogRisqueComponent {
  risqueInfo: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.risqueInfo = this.data.risque;
  }
}

