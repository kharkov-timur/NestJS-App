import * as moment from 'moment';

export const TODAY = moment().format();

export const dateConvertor = (date) => moment(date).format();

export const expireDateSetRating = (endDate) =>
  moment(endDate).add(7, 'd').format();
