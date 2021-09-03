import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, AfterContentInit } from '@angular/core';

import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-cpu'
import * as handpose from "@tensorflow-models/handpose"; //yarn add @tensorflow-models/handpose



//Autor: Pablo García-Borrón
//TFG: Universidad de Murcia 
//Programa: Control de interfaces en una aplicacion angular usando gestos.
 

/*
Documentacion:
Exolicar q es un tensor:
  Modelo matematico.
   tensor: un escalar será considerado como un tensor de orden 0;
   un vector, un tensor de orden 1;
   los tensores de segundo orden pueden ser representados por una matriz. 

El tensor es la unidad de procesamiento en TF


Usamos modelo pre entrenado aportado por Google/TFJS fingerpose JS


*/

/*
Notas: 

async() permite uso de programacion paralela 


*/

interface Hand {
  indexFinger: Finger,

  middleFinger: Finger,

  palmBase: Finger,

  pinky: Finger,

  ringFinger: Finger,

  thumb: Finger
}
interface Finger {
  keypoints: any
}






@Component({
  selector: 'app-video-component',
  templateUrl: './video-component.component.html',
  styleUrls: ['./video-component.component.css']
})
export class VideoComponentComponent implements AfterContentInit {

  stream: any //stream de datos dirigido desde mediadevice
  webcam: any //webcam de tfjs
  error: any;//variable de manejo de errores
  model: any; //modelo pre entrenado de fingerpose
  private ctx: CanvasRenderingContext2D; //canvas para plot puntos
  cantidad:number=0;

  @ViewChild("video") video: ElementRef;
  @ViewChild('renderer', { static: true }) handRenderer: ElementRef<HTMLCanvasElement>;

  constructor() { }


  async ngAfterContentInit() {

    this.ctx = this.handRenderer.nativeElement.getContext('2d')!;    //Inicializacion de camara+manejo de errores 
    await this.setupDevices();

  }
  async setupDevices() {
    //Acceso a camara como indicado en https://trungk18.com/experience/capture-webcam-picture-angular/
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true, audio: false
        });

        //Al solicitar user media salta popup, 3 posibles resultados:
        //User acepta permisos
        //user rechaza permisos: permisionDeniedErrror
        //no hay camara y not found

        if (stream) {
          this.video.nativeElement.srcObject = stream;

          //this.video.nativeElement.play();
          await this.processVideo()

          this.error = null;
        } else {
          this.error = "You have no output video device";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  async processVideo() {
    //cuando ya este todo disponible
    this.video.nativeElement.onloadedmetadata = async () => {

      this.video.nativeElement.play();
      this.webcam = await tf.data.webcam(this.video.nativeElement);
      this.model = await handpose.load();

      while (true) {

        const frame = await this.webcam.capture() //guardamos la imagen de la webcam

        const prediction = await this.model.estimateHands(frame);      //predecimos posicion de dedeos

        this.procesarPrediccion(prediction)

        frame.dispose() //el recolector de basura no funciona con Tensores 

        await tf.nextFrame(); //pedimos siguiente imagen de la camara

        //acceso al backend de tensorflow 
        //tf se puede ejecutar en cliente o servidor

      }

    }



  }

  //https://medium.com/angular-in-depth/how-to-get-started-with-canvas-animations-in-angular-2f797257e5b4

  procesarPrediccion(pred: any) {
    this.pintarKeyPoints(pred)
    //estudiar prediccion


  }

  pintarKeyPoints(prediction: any) {
    this.ctx.clearRect(0, 0, 640, 480);//clear del canvas

    if (Object.entries(prediction).length > 0) {
      console.log(prediction[0].landmarks)

      let hand: Hand = prediction[0].annotations;
      let keypoints = [0, 1, 2, 3]; //keypoints

      /*
  indexFinger
    middleFinger
    palmBase  ​
    pinky
    ringFinger
    thumb
  
      */

      for (let kp of keypoints) {
        //console.log(prediction[0].annotations.thumb[kp])
        this.ctx.fillRect(prediction[0].annotations.thumb[kp][0], prediction[0].annotations.thumb[kp][1], 10, 10);


      }
      for (let kp of keypoints) {
        //console.log(prediction[0].annotations.indexFinger[kp])
        this.ctx.fillRect(prediction[0].annotations.indexFinger[kp][0], prediction[0].annotations.indexFinger[kp][1], 10, 10);


      }
      for (let kp of keypoints) {
        //console.log(prediction[0].annotations.middleFinger[kp])
        this.ctx.fillRect(prediction[0].annotations.middleFinger[kp][0], prediction[0].annotations.middleFinger[kp][1], 10, 10);


      }
      for (let kp of keypoints) {
        //console.log(prediction[0].annotations.ringFinger[kp])
        this.ctx.fillRect(prediction[0].annotations.ringFinger[kp][0], prediction[0].annotations.ringFinger[kp][1], 10, 10);


      }
      for (let kp of keypoints) {
       // console.log(prediction[0].annotations.pinky[kp])
        this.ctx.fillRect(prediction[0].annotations.pinky[kp][0], prediction[0].annotations.pinky[kp][1], 10, 10);

      }


    }
  }

add(){
 this.cantidad+=1;
}

delete(){
  if (this.cantidad>=1){
    this.cantidad-=1;

  }


}
}
