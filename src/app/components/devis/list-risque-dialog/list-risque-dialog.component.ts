import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatAccordion } from '@angular/material/expansion';

import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // pour support des dates natives (JS)
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';

import {  ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-list-risque-dialog',
  standalone:true,
  imports:[
        // Angular Core
        CommonModule,
        FormsModule,
        RouterModule,
        // Angular Material
        MatStepperModule,
        MatIconModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSortModule,
        MatSnackBarModule,
        MatDialogModule,    
        MatSelectModule,
        MatOptionModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule, // ou MatMomentDateModule si tu veux Moment
        MatMenuModule,
        MatPaginatorModule,
        ReactiveFormsModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule
  ],
  templateUrl: './list-risque-dialog.component.html',
  styleUrls: ['./list-risque-dialog.component.scss']
})
export class ListRisqueDialogComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  constructor(public dialogRef: MatDialogRef<ListRisqueDialogComponent>,@Inject(MAT_DIALOG_DATA) public data: any) { }

  dataSourceListParamRisque = new MatTableDataSource();
  retourData: any;
  paramListAttr:any[]=[]
  ngOnInit(): void {
   
    this.retourData = this.data.dataSourceListParamRisque
 
    this.dataSourceListParamRisque.data = this.data.dataSourceListParamRisque.filter((value: any) => {
      return this.data.displayedColumnsListParamRisque.every((cle: any) => value.hasOwnProperty(cle));
    });
    this.data.displayedColumnsListParamRisque.push("action")
    this.data.listParamRisque.map((el:any)=>this.paramListAttr.push(el.libelle))
    // this.dataSourceListParamRisque.paginator = this.paginator;
  }

  deleteList(index: any) {
    const data = this.retourData
    const data2 = this.dataSourceListParamRisque.data
    data.splice(index, 1)
    data2.splice(index, 1)
    this.retourData = data
    this.dataSourceListParamRisque = new MatTableDataSource(data2);
  }

  ajouterParam() {
    
    if(this.data?.garantie?.codeGarantie=="G53" && this.dataSourceListParamRisque?.data?.length == this.data?.numberEffective){
      Swal.fire(
        "le nombre d'effectif a atteint le nombre de d'effectif indiqué",
        `error`
      )
      return
    }

    if(this.data.formListParamRisque.valid)
    {
      const newData = [...this.dataSourceListParamRisque.data, this.data.formListParamRisque.value];
      this.retourData.push(this.data.formListParamRisque.value) 
      this.dataSourceListParamRisque.data = newData;
      this.data.formListParamRisque.reset()
    }
  }
  submitList(){
    this.dialogRef.close({data:this.retourData,listAtt:this.paramListAttr})
  }
}
