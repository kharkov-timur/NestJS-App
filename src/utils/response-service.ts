export interface IResponseService {
  message: string;
}

export class ResponseService {
  public createUserSuccess() {
    return { message: 'User created successfully' };
  }

  public deletedUserCanceled(events: number) {
    return {
      message: `You cannot delete a user who has ${events} unfinished events`,
    };
  }

  public blockUserSuccess(blockUserId: number, fieldName: string) {
    return {
      message: `User with id: ${blockUserId} blocked to this ${fieldName}`,
    };
  }

  public emailConfirmSuccess() {
    return { message: 'Email confirmed successfully' };
  }

  public emailSent() {
    return { message: 'Email sent' };
  }

  public updateUserSuccessNeedVerify(credentials: {
    email?: string;
    phone?: string;
  }) {
    const keys = Object.keys(credentials);
    return {
      logout: true,
      message: `Changed successfully. Please verify your ${keys.join(', ')}`,
    };
  }

  public passwordChangeSuccess() {
    return { message: 'Password successfully changed' };
  }

  public deleteUserSuccess() {
    return { message: 'User deleted successfully' };
  }

  public deleteEventSuccess(eventId: number) {
    return {
      eventId,
      message: `Event with id: ${eventId} successfully deleted`,
    };
  }

  public uploadImageSuccess(photo: string) {
    return { message: `Photo ${photo} successfully uploaded` };
  }

  public deleteImageSuccess(photo: string) {
    return { message: `Photo ${photo} successfully deleted` };
  }

  public deleteChatSuccess(chatId: number) {
    return { chatId, message: `Chat with id: ${chatId} successfully deleted` };
  }

  public friendRequest() {
    return { message: 'Subscription request sent to user' };
  }

  public unsubscribeToUser() {
    return { message: 'You have unsubscribed from a user' };
  }

  public eventSubscribeRequest() {
    return { message: 'You have sent an event subscription request' };
  }

  public eventSubscribed() {
    return { message: 'You have subscribed to the event' };
  }

  public confirmEventRequest() {
    return { message: 'Request event accepted' };
  }

  public unsubscribeToEvent() {
    return { message: 'Unsubscribed from event' };
  }

  public confirmRequestToUser() {
    return { message: 'Friend request accepted' };
  }

  public monitorEnabled() {
    return { message: 'Event monitor enabled' };
  }

  public monitorChanged() {
    return { message: 'The monitor has been changed' };
  }

  public monitorDeleted() {
    return { message: 'The monitor has been deleted' };
  }

  public pushNotificationSent() {
    return { message: 'Push notification sent' };
  }

  public deleteDeviceSuccess(deviceId: string) {
    return {
      message: `Device with id: ${deviceId} successfully deleted`,
    };
  }

  public deleteCommentSuccess() {
    return { message: 'Comment deleted successfully' };
  }
}
