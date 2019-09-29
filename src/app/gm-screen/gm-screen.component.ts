import { Component, OnInit } from '@angular/core';
import { Player } from '../models/player';
import { AssetFile } from '../models/assetFile';
import { RxStompService } from '@stomp/ng2-stompjs';
import { HttpClient } from '@angular/common/http';
import { QueueMessage } from '../models/message';
import { ActionEnum } from '../models/actionEnum';
import { Asset } from '../models/asset';

@Component({
  selector: 'app-gm-screen',
  templateUrl: './gm-screen.component.html',
  styleUrls: ['./gm-screen.component.css']
})

export class GmScreenComponent implements OnInit {

  Players: Player[] = [];

  Backgrounds: AssetFile = new AssetFile();
  Cards: AssetFile = new AssetFile();
  Sfxs: AssetFile = new AssetFile();
  Vfxs: AssetFile = new AssetFile();

  SelectedBackground: string = '';
  BaseBackgroundsUrl: string = '';
  SelectedCard: string;
  SelectedPlayer: Player;

  Visibility: string = 'hidden';

  constructor(private rxStompService: RxStompService, private http: HttpClient) {

    let message = new QueueMessage(ActionEnum.CLEAR_PLAYERS, [], this.SelectedPlayer);
    this.sendQueueMessage(message);

    this.http.get('./assets/backgrounds.json').subscribe(response => {
      this.Backgrounds = response as AssetFile;
      this.BaseBackgroundsUrl = this.Backgrounds.BaseUrl;
      this.SelectedBackground = this.Backgrounds.Assets[0].Name + '.jpg';
    });
    this.http.get('./assets/cards.json').subscribe(response => {
      this.Cards = response as AssetFile;
      this.SelectedCard = this.Cards.Assets[0].Name + '.jpg';
    });
    this.http.get('./assets/sfxs.json').subscribe(response => {
      this.Sfxs = response as AssetFile;
    });
    this.http.get('./assets/vfxs.json').subscribe(response => {
      this.Vfxs = response as AssetFile;
    });

    //this.Players.push(new Player("Iri", "Irina", "white", "blue"));
    //this.Players.push(new Player("Sor", "Soraya", "black", "cyan"));
    this.Players.push(new Player("Adr", "Adrian", "black", "yellow"));
    this.Players.push(new Player("Dor", "Dorian", "white", "purple"));
    this.Players.push(new Player("Lup", "Lupin", "white", "green"));
    this.Players.push(new Player("All", "Allister", "white", "red"));

    for (var i = 0; i < this.Players.length; i++) {
      let message = new QueueMessage(ActionEnum.ADD_PLAYER, this.Players[i], this.SelectedPlayer);
      this.sendQueueMessage(message);

      this.SelectedPlayer = this.Players[0];
    }

    this.changeBackground();
  }

  ngOnInit() {
  }

  mouseUpHandler(player: Player) {

    var element = document.getElementById(player.Guid);
    var style = window.getComputedStyle(element);
    var matrix = new WebKitCSSMatrix(style.webkitTransform);

    player.X = matrix.m41;
    player.Y = matrix.m42;
    player.IsCreation = false;

    let message = new QueueMessage(ActionEnum.MOVE_PLAYER, player, player);

    this.rxStompService.publish({ destination: '/topic/mjdr-party-manager-queue', body: JSON.stringify(message) });

    this.SelectedPlayer = player;
  }

  playFx(fx: Asset) {

    let sfxPath = this.Sfxs.BaseUrl + fx.Name;
    let vfxPath = this.Vfxs.BaseUrl + fx.Name;
    let backgroundPath = this.Backgrounds.BaseUrl + fx.Name;

    let message = new QueueMessage(ActionEnum.SFX_ON, sfxPath, this.SelectedPlayer);
    this.sendQueueMessage(message);

    if (this.SelectedPlayer !== undefined) {
      this.SelectedPlayer.SfxBackgroundImage = vfxPath + ".png";

      message = new QueueMessage(ActionEnum.VFX_ON, this.SelectedPlayer.SfxBackgroundImage, this.SelectedPlayer);
      this.sendQueueMessage(message);
    }

    else if (fx.Name.startsWith("SPH-")) {
      this.SelectedBackground =  fx.Name + ".png";
      this.changeBackground();
    }

    message = new QueueMessage(ActionEnum.MANAGE_COLOR, fx.Name, this.SelectedPlayer);
    this.sendQueueMessage(message);
  }

  stopFx() {

    if (this.SelectedPlayer !== undefined) {
      this.SelectedPlayer.SfxBackgroundImage = "";
    }
    else {
      this.SelectedBackground = this.Backgrounds.Assets[0].Name + ".jpg";
      this.changeBackground();
    }

    let message = new QueueMessage(ActionEnum.FX_OFF, "", this.SelectedPlayer);
    this.sendQueueMessage(message);

    message = new QueueMessage(ActionEnum.SET_TO_DEFAULT_COLOR, "", this.SelectedPlayer);
    this.sendQueueMessage(message);
  }

  changeBackground() {
    if (this.SelectedBackground !== '') {
      let message = new QueueMessage(ActionEnum.SET_BACKGROUND, this.SelectedBackground, this.SelectedPlayer);

      this.sendQueueMessage(message);
    }
  }

  addCard() {
    let newCard = new Player("+", this.SelectedCard.substring(this.SelectedCard.length - 4, 4), "white", "blue", 'assets/cards/' + this.SelectedCard);
    this.Players.push(newCard);

    this.SelectedPlayer = newCard;

    let message = new QueueMessage(ActionEnum.ADD_PLAYER, newCard, this.SelectedPlayer);
    this.sendQueueMessage(message);
  }

  removeCard() {
    this.Players.splice(this.Players.indexOf(this.SelectedPlayer), 1);

    let message = new QueueMessage(ActionEnum.REMOVE_PLAYER, this.SelectedPlayer, this.SelectedPlayer);
    this.sendQueueMessage(message);
    this.SelectedPlayer = undefined;
  }

  selectPlayer(player: Player) {
    this.SelectedPlayer = player;
  }

  toggleVisibility() {
    if (this.Visibility === "hidden")
      this.Visibility = "visible";
    else
      this.Visibility = "hidden";

    let message = new QueueMessage(ActionEnum.SET_VISIBILITY, this.Visibility, this.SelectedPlayer);
    this.sendQueueMessage(message);
  }

  clearSelectedPlayer() {
    this.SelectedPlayer = undefined;
  }

  sendQueueMessage(message: QueueMessage) {

    this.rxStompService.publish({ destination: '/topic/mjdr-party-manager-queue', body: JSON.stringify(message) });
  }
}
