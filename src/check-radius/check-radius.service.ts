import * as geo from 'geolib';
import { Injectable } from '@nestjs/common';

import { IEvent } from '../events/interfaces/event.interface';
import { IDeviceForSendMessage } from '../push-notification/device/interfaces/device.interface';

@Injectable()
export class CheckRadiusService {
  private static lat(location: string) {
    return location.split(',')[0];
  }

  private static lng(location: string) {
    return location.split(',')[1];
  }

  public checkRadiusForEvents(
    events: IEvent[],
    userLocation: string,
    searchRadius: number,
  ): IEvent[] {
    const data = [];
    const earthRadius = 6371;
    const radius = !searchRadius ? earthRadius : searchRadius;

    const userLat = CheckRadiusService.lat(userLocation);
    const userLng = CheckRadiusService.lng(userLocation);

    for (const event of events) {
      const eventLat = CheckRadiusService.lat(event.location);
      const eventLng = CheckRadiusService.lng(event.location);

      const checkInRadius = geo.isPointWithinRadius(
        { latitude: eventLat, longitude: eventLng },
        { latitude: userLat, longitude: userLng },
        radius * 1000,
      );

      if (checkInRadius) {
        data.push(event);
      }
    }

    return data;
  }

  public checkRadiusForDevices(
    devices: IDeviceForSendMessage[],
    userLocation: string,
  ): IDeviceForSendMessage[] {
    const data = [];
    const userLat = CheckRadiusService.lat(userLocation);
    const userLng = CheckRadiusService.lng(userLocation);

    for (const device of devices) {
      const eventLat = CheckRadiusService.lat(device.location);
      const eventLng = CheckRadiusService.lng(device.location);

      const checkInRadius = geo.isPointWithinRadius(
        { latitude: eventLat, longitude: eventLng },
        { latitude: userLat, longitude: userLng },
        device.radius * 1000,
      );

      if (checkInRadius) {
        data.push(device);
      }
    }

    return data;
  }
}
