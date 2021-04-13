import { Inject } from '@nestjs/common';
import { getToken, Token } from './token';

export const getTopicToken = (topicName: Token): Token => getToken(topicName, 'Topic');

export const InjectTopic = (topicName: Token): ParameterDecorator =>
  Inject(getTopicToken(topicName));
