const request = require('supertest');
const app = require('./index'); // Assuming your Express app is in a separate file
const Category = require('./models/category'); // Assuming you have a Category model defined
describe('/:lang', () => {
    it('should retrieve category list in English', async () => {
      // Mock the response from the Category model
      const mockCategoryList = [
        {  name: 'Category 1', nameA: 'Arabic Name 1' },
        {  name: 'Category 2', nameA: 'Arabic Name 2' },
      ];
      Category.find.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(mockCategoryList),
      });
  
      // Send a GET request to the route with lang parameter as 'en'
      const response = await request(app).get('/category/en');
  
      // Perform assertions to validate the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategoryList);
    });
  
    it('should retrieve category list in Arabic', async () => {
      // Mock the response from the Category model
      const mockCategoryList = [
        { _id: '1', name: 'Category 1', nameA: 'Arabic Name 1' },
        { _id: '2', name: 'Category 2', nameA: 'Arabic Name 2' },
      ];
      Category.find.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(mockCategoryList),
      });
  
      // Send a GET request to the route with lang parameter as 'ar'
      const response = await request(app).get('/category/ar');
  
      // Perform assertions to validate the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategoryList);
    });
  
    it('should handle error if category list is not found', async () => {
      // Mock the response from the Category model
      Category.find.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(null),
      });
  
      // Send a GET request to the route with lang parameter as 'en'
      const response = await request(app).get('/category/en');
  
      // Perform assertions to validate the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false });
    });
  
    // Add more test cases to cover different scenarios
  });
  