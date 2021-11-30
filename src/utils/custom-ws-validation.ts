import { WsException } from '@nestjs/websockets';

export class CustomWsValidation {
  unauthorized(): WsException {
    throw new WsException('User not authorized!');
  }

  badAuth(): WsException {
    throw new WsException('Incorrect token');
  }

  noAccessToChat(
    entityName: string,
    fieldName: string,
    fieldValue: string | number,
  ): WsException {
    throw new WsException(
      `${entityName} with ${fieldName}: ${fieldValue} is not subscribed on event for this chat`,
    );
  }

  notFound(
    entityName: string,
    fieldName: string,
    fieldValue: string | number,
  ): WsException {
    throw new WsException(
      `${entityName} with ${fieldName}: ${fieldValue} not found`,
    );
  }
}
