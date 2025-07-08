import { IsNotEmpty, IsString } from 'class-validator';

export class YoutubeCallbackDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
