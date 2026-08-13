import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, Check, CircleAlert, CloudUpload, Download, FileCheck2, FileSpreadsheet, Info, LucideAngularModule, Save, ShieldAlert, Trash2 } from 'lucide-angular';
import { ImportPreview } from '../../core/models/title.models';
import { TitleApiService } from '../../core/services/title-api.service';
import { saveBlob } from '../../shared/download';

@Component({selector:'app-title-upload',standalone:true,imports:[RouterLink,LucideAngularModule],templateUrl:'./title-upload.component.html',styleUrl:'./title-upload.component.scss'})
export class TitleUploadComponent{
 private readonly api=inject(TitleApiService);readonly icons={ArrowLeft,Check,CircleAlert,CloudUpload,Download,FileCheck2,FileSpreadsheet,Info,Save,ShieldAlert,Trash2};
 readonly file=signal<File|null>(null);readonly drag=signal(false);readonly loading=signal(false);readonly preview=signal<ImportPreview|null>(null);readonly toast=signal('');
 choose(event:Event){const input=event.target as HTMLInputElement;if(input.files?.[0])this.setFile(input.files[0]);}
 drop(event:DragEvent){event.preventDefault();this.drag.set(false);if(event.dataTransfer?.files[0])this.setFile(event.dataTransfer.files[0]);}
 setFile(file:File){if(!file.name.match(/\.xlsx?$/i)){this.notify('Please choose an Excel file');return;}this.file.set(file);this.preview.set(null);}
 remove(){this.file.set(null);this.preview.set(null);}
 validate(saveAfterValidation=false){const file=this.file();if(!file)return;this.loading.set(true);this.api.previewImport(file).subscribe({next:value=>{this.preview.set(value);this.loading.set(false);if(saveAfterValidation&&value.cleanCount>0)this.commitPreview(value);else this.notify('Test upload complete. No data was saved.');},error:()=>{this.loading.set(false);this.notify('Validation failed. Please check the API and spreadsheet.');}});}
 commit(){const value=this.preview();if(value)this.commitPreview(value);}
 template(){this.api.template().subscribe({next:blob=>saveBlob(blob,'UploadTitles.xlsx'),error:()=>this.notify('Connect the API to download the template')});}
 notify(message:string){this.toast.set(message);setTimeout(()=>this.toast.set(''),2800);}
 private commitPreview(value:ImportPreview){this.loading.set(true);this.api.commitImport(value.importToken).subscribe({next:()=>{this.loading.set(false);this.notify(`${value.cleanCount} clean titles saved successfully`);},error:()=>{this.loading.set(false);this.notify('Save failed. Please check the API.');}});}
}
