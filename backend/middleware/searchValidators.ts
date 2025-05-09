import { query } from 'express-validator';

export const searchValidators = [
  query('q')
    .notEmpty().withMessage('Search query is required')
    .trim()
    .escape(),
    
  query('media_type')
    .optional()
    .isIn(['image', 'audio', 'video']).withMessage('Invalid media type'),
    
  query('license')
    .optional()
    .isString().withMessage('License must be a string'),
    
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt()
];