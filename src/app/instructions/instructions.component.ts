import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.scss']
})
export class InstructionsComponent implements OnInit {

  constructor(public dialogref:MatDialogRef<InstructionsComponent>) { }

  ngOnInit(): void {
  }

     close(){
        this.dialogref.close(1)
     }
}
