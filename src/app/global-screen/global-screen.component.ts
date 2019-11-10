import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AssetFile } from '../models/assetFile';
import { Player } from '../models/player';
import { QueueMessage } from '../models/message';
import { Subscription } from 'rxjs';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { ActionEnum } from '../models/actionEnum';

@Component({
  selector: 'app-global-screen',
  templateUrl: './global-screen.component.html',
  styleUrls: ['./global-screen.component.css']
})
export class GlobalScreenComponent implements OnInit {

  private hueBridgeUrl: string = 'http://192.168.1.119/api/OTBB0J8zWAiqUiDNrXcq7Ym6XYVEw1w5cuJldEIv/groups/1/action';

  Players: Player[] = [];

  Backgrounds: AssetFile = new AssetFile();
  Cards: AssetFile = new AssetFile();
  Sfxs: AssetFile = new AssetFile();
  Vfxs: AssetFile = new AssetFile();
  Trailers: AssetFile = new AssetFile();

  BaseBackgroundsUrl: string = '';
  SelectedBackground: string = '';
  SelectedPlayer: Player;

  Visibility: string = 'hidden';

  private topicSubscription: Subscription;
  private audioLayerNumber: number = 3;

  constructor(private rxStompService: RxStompService, private http: HttpClient) {
    this.http.get('./assets/backgrounds.json').subscribe(response => {
      this.Backgrounds = response as AssetFile;
      this.BaseBackgroundsUrl = this.Backgrounds.BaseUrl;
      this.SelectedBackground = this.Backgrounds.Assets[0].Name + '.png';
    });
    this.http.get('./assets/cards.json').subscribe(response => {
      this.Cards = response as AssetFile;
    });
    this.http.get('./assets/sfxs.json').subscribe(response => {
      this.Sfxs = response as AssetFile;
    });
    this.http.get('./assets/vfxs.json').subscribe(response => {
      this.Vfxs = response as AssetFile;
    });
    this.http.get('./assets/trailers.json').subscribe(response => {
      this.Trailers = response as AssetFile;
    });
    this.topicSubscription = this.rxStompService.watch('/topic/mjdr-party-manager-queue').subscribe((message: Message) => {
      this.manageReceivedMessage(message);
    });
  }

  ngOnInit() {
    var trailerVideoplayer = <HTMLVideoElement>document.getElementById('trailerVideoplayer');
    trailerVideoplayer.hidden = true;
  }

  manageReceivedMessage(message: Message) {
    let receivedMessage: QueueMessage;
    let player: Player;

    receivedMessage = JSON.parse(message.body);

    console.info(receivedMessage);

    switch (receivedMessage.MessageType) {
      case ActionEnum.ADD_PLAYER:
        player = receivedMessage.RawData;
        this.Players.push(player);
        if (this.Players.length > 0) {
          this.SelectedPlayer = this.Players[0];
        }
        break;
      case ActionEnum.MOVE_PLAYER:
        player = receivedMessage.RawData;
        this.movePlayer(player);
        break;
      case ActionEnum.REMOVE_PLAYER:
        player = receivedMessage.RawData;
        this.Players.splice(this.Players.indexOf(this.Players.find(p => p.Guid === receivedMessage.Target.Guid)), 1);
        break;
      case ActionEnum.VFX_ON:
        if (receivedMessage.Target !== undefined) {
          let currentPlayerVfx = this.Players.find(p => p.Guid === receivedMessage.Target.Guid);

          if (currentPlayerVfx !== undefined) {
            currentPlayerVfx.SfxBackgroundImage = receivedMessage.RawData;
          }
        }
        break;
      case ActionEnum.SFX_ON:
        this.playSfx(receivedMessage.RawData);
        break;
      case ActionEnum.FX_OFF:
        if (receivedMessage.Target !== undefined) {
          let currentPlayerSFx = this.Players.find(p => p.Guid === receivedMessage.Target.Guid);
          if (currentPlayerSFx !== undefined) {
            currentPlayerSFx.SfxBackgroundImage = "";
          }
        }
        this.stopSfx();
        break;
      case ActionEnum.SET_BACKGROUND:
        if (receivedMessage.RawData !== '') {
          this.SelectedBackground = receivedMessage.RawData;
        }
        break;
      case ActionEnum.SET_VISIBILITY:
        this.Visibility = receivedMessage.RawData;
        break;
      case ActionEnum.SET_TO_DEFAULT_COLOR:
        this.stopVfx();
        break;
      case ActionEnum.MANAGE_COLOR:
        this.manageColor(receivedMessage.RawData);
        break;
      case ActionEnum.CLEAR_PLAYERS:
        this.Players = [];
        break;
      default:
        break;
    }
  }

  movePlayer(player: Player) {
    let currentPlayer = this.Players.find(p => p.Guid === player.Guid);
    currentPlayer.X = player.X * 2;
    currentPlayer.Y = player.Y * 2;
  }

  playSfx(sfxPath: string) {
    console.log("playsfx:" + sfxPath)
    if (sfxPath !== '') {
      var layerNumber = 1;
      while (!this.manageLayers(<HTMLAudioElement>document.getElementById('sfxPlayer00' + layerNumber), sfxPath + ".mp3") || layerNumber > this.audioLayerNumber) {
        layerNumber++;
      }
    }
  }

  stopSfx() {
    for (var i = 1; i <= this.audioLayerNumber; i++) {
      let audioElement = (<HTMLAudioElement>document.getElementById('sfxPlayer00' + i));
      if (audioElement !== undefined && audioElement !== null) {
        audioElement.pause();
        audioElement.load();
      }
    }

    let videoElement = (<HTMLVideoElement>document.getElementById('trailerVideoplayer'));
    if (videoElement !== undefined && videoElement !== null) {
      videoElement.pause();
      videoElement.load();
      videoElement.hidden = true;
    }
  }

  private manageLayers(audioElement: HTMLAudioElement, sfxPath: string): boolean {
    console.log("audioElement :" + audioElement)
    console.log("sfxPath: " + sfxPath)
    if (!this.isPlaying(audioElement)) {
      audioElement.src = '' + sfxPath;
      audioElement.load();
      audioElement.play();
      return true;
    }
    return false;
  }

  private isPlaying(audioElement: HTMLAudioElement): boolean {
    return !audioElement.paused;
  }

  playVideoTrailer(trailerName: string) {
    var trailerVideoplayer = <HTMLVideoElement>document.getElementById('trailerVideoplayer');
    trailerVideoplayer.src = './assets/sfx/TRL-003-001.mp4';
    trailerVideoplayer.load();
    trailerVideoplayer.play();
    trailerVideoplayer.hidden = false;
  }

  manageColor(sfxPath: string) {
    var rq = '';

    if (sfxPath == "default") {
      this.changeColor(true, 77, 254, 41435);
    }
    else if (sfxPath == "TRL-003-001") {
      this.changeColor(false, 64, 254, 42290);
    }
    else {
      if (sfxPath == "SPH-COR")
        this.changeColor(true, 254, 254, 49201);
    }
  }

  changeColor(on: boolean, sat: number, bri: number, hue: number) {
    if (on === true) {
      this.http.put(this.hueBridgeUrl, { "on": on, "sat": sat, "bri": bri, "hue": hue }, this.optionRequete).subscribe();
    }
    else if (on === false) {
      this.http.put(this.hueBridgeUrl, { "on": on, "sat": sat, "bri": bri, "hue": hue }, this.optionRequete).subscribe();
    }
  }

  private optionRequete = {
    headers: new HttpHeaders({
    })
  }

  stopVfx() {
    this.changeColor(true, 77, 254, 41435);
  }

  ngOnDestroy() {
    this.topicSubscription.unsubscribe();
  }

}
