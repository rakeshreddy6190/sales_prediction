import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FileService {
  testObject:any={}
  pp:any={}
  constructor(private httpClient:HttpClient) { }
  upload(Obj,name):Observable<any>{
    console.log("file service upload..." )  
    var obj=[];
    obj[0]=name
    obj[1]=Obj
    return this.httpClient.post('/api/upload',obj);
      
  }
  test(Obj){
      console.log("test called")
      return this.httpClient.post('/api/test',Obj).subscribe(()=>{},()=>{  console.log("error raised")  })
  }
  run(obj){
    console.log("I am from service run () ",obj)
      return this.httpClient.post('/api/runMain',{'name':obj},{responseType:'text'});
  }
  getResult(name){
    console.log("Get Result service called...",name)
      return this.httpClient.post('/api/getResult',{'name':name});
  }
}
