export interface IDevice {
  deviceId: string;
  platform: string;
  deviceToken: string;
  location: string;
}

export interface IDeviceForSendMessage {
  deviceToken: string;
  deviceId: string;
  location: string;
  radius: number;
}
