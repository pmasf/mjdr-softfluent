import { Guid } from './guid';

export class Player {
  Guid: string;
  Name: string;
  UiName: string;
  Color: string;
  BackgroundColor: string;
  SfxBackgroundImage: string;
  DefaultBackgroundImage: string;
  CssClass: string = 'player-box';
  Transition: string = 'all 1.5s ease';
  X: number;
  Y: number;
  IsCreation: boolean;
  IsDestruction: boolean;
  ZIndex: number = 1;

  constructor(
    name: string,
    uiName: string,
    color: string,
    backgroundColor: string,
    backgroundImage: string = undefined
  ) {
    this.Guid = Guid.newGuid();
    if (backgroundImage === undefined) {
      this.Color = color;
      this.BackgroundColor = backgroundColor;
      this.DefaultBackgroundImage = '';
    } else {
      this.DefaultBackgroundImage = backgroundImage;
    }
    this.SfxBackgroundImage = this.DefaultBackgroundImage;
    this.Name = name;
    this.UiName = uiName.substr(0, 3);
    this.X = 0;
    this.Y = 0;
    this.IsCreation = true;
    this.IsDestruction = false;
  }
}
