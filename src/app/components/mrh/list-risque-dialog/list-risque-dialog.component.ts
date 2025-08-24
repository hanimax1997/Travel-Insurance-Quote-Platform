import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatError } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // nécessaire pour DatePicker
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-risque-dialog',
  standalone: true,
  templateUrl: './list-risque-dialog.component.html',
  styleUrls: ['./list-risque-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ]
})
export class ListRisqueDialogComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  dataSourceListParamRisque = new MatTableDataSource();
  retourData: any;
  paramListAttr: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ListRisqueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.retourData = this.data.dataSourceListParamRisque;

    this.dataSourceListParamRisque.data = this.data.dataSourceListParamRisque.filter((value: any) => {
      return this.data.displayedColumnsListParamRisque.every((cle: any) => value.hasOwnProperty(cle));
    });
    this.data.displayedColumnsListParamRisque.push("action");
    this.data.listParamRisque.map((el: any) => this.paramListAttr.push(el.libelle));
    // this.dataSourceListParamRisque.paginator = this.paginator;
  }

  deleteList(index: any) {
    const data = this.retourData;
    const data2 = this.dataSourceListParamRisque.data;
    data.splice(index, 1);
    data2.splice(index, 1);
    this.retourData = data;
    this.dataSourceListParamRisque = new MatTableDataSource(data2);
  }

  ajouterParam() {
    if (this.data?.garantie?.codeGarantie == "G53" && this.dataSourceListParamRisque?.data?.length == this.data?.numberEffective) {
      Swal.fire(
        "le nombre d'effectif a atteint le nombre de d'effectif indiqué",
        `error`
      );
      return;
    }

    if (this.data.formListParamRisque.valid) {
      const newData = [...this.dataSourceListParamRisque.data, this.data.formListParamRisque.value];
      this.retourData.push(this.data.formListParamRisque.value);
      this.dataSourceListParamRisque.data = newData;
      this.data.formListParamRisque.reset();
    }
  }

  submitList() {
    this.dialogRef.close({ data: this.retourData, listAtt: this.paramListAttr });
  }
}