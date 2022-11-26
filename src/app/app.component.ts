import { Component } from '@angular/core';
import {FileService} from '../app/services/file.service'
import { MatDialog } from '@angular/material/dialog'
import { InstructionsComponent } from './instructions/instructions.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  floor=Math.floor
  uploaded:boolean=false;
  title = 'FP';
  ran:boolean=false;
  retrievedData:any[]=[]
  fileToUpload: File = null;
  lu:boolean=false
  dataUrl:string | ArrayBuffer=""
  Obj:any=[];
  
  load:boolean=false;

  file: File;
  fileName:string;
  imageUrl: string | ArrayBuffer;

  constructor(private fs:FileService,public dialog:MatDialog){

  }
  

  onChange(file:File){
    this.Obj=[]
    const reader = new FileReader();
    this.fileToUpload = file;
    console.log("called",this.fileToUpload.name.split('.')[0])
   
    reader.onload = () => {
      let text:any = reader.result;      
      var lines = text.split("\n");

    var result = [];

    var headers:string[]= lines[0].split(",");
      
    for (var i = 1; i < lines.length-1; i++) {

        var obj:any = {};
        var currentline = lines[i].split(",");
        var  j;
        for (j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
       
        result.push(obj);

    }
    this.Obj=result;
    console.log(this.Obj)
      //var json = this.csvJSON(text);
    };
    reader.readAsText(this.fileToUpload)
    
  }   


  upload(){
    this.load=true
      this.fs.upload(this.Obj,this.fileToUpload.name.split('.')[0]).subscribe((result)=>{
            this.load=false;
            this.uploaded=true
      })
      
  } 

run(){
  this.load=true
    this.fs.run(this.fileToUpload.name.split('.')[0]).subscribe((res)=>{
        console.log("res",res)        
    },(err)=>{ console.log(err); this.load=false; this.ran=true },()=>{ this.load=false; this.ran=true })
}

getResults(){
  this.retrievedData=[]
  console.log("get reulsts called")
      this.fs.getResult(this.fileToUpload.name.split('.')[0]).subscribe((data)=>{
          if(data['message']=='success'){
              this.retrievedData=data['data'];
              this.retrievedData
              console.log(this.retrievedData)
          }
          else{
            console.log(data);
          }
      })
}


demo(){
    const ref=this.dialog.open(InstructionsComponent)
    
}

}
