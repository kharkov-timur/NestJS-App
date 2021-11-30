import { ValidationArguments } from 'class-validator';
import { TYPES } from '../constants/constants';

export function enumValidationMessage(args: ValidationArguments): string {
  return `${args.value} in field ${
    args.property
  } must have one of valid values: ${Object.values(args.constraints[0])}`;
}

export function typesValidation(args: ValidationArguments): any {
  return `${args.value} in field ${args.property} must have one of valid values: ${TYPES}`;
}

export function hobbiesValidation(args: ValidationArguments): any {
  return `${args.value} in field ${args.property} must have one of valid values: ${TYPES}`;
}
