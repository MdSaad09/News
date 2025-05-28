import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import categoryService from '../../services/categoryService';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getCategories();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch categories: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    try {
      const categoryData = {
        name: newCategory,
        description: categoryDescription
      };
      
      const createdCategory = await categoryService.createCategory(categoryData);
      setCategories([...categories, createdCategory]);
      setNewCategory('');
      setCategoryDescription('');
      toast.success('Category added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    try {
      const categoryData = {
        name: newCategory,
        description: categoryDescription
      };
      
      const updatedCategory = await categoryService.updateCategory(editingCategory.id, categoryData);
      
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? updatedCategory : cat
      ));
      
      setNewCategory('');
      setCategoryDescription('');
      setEditingCategory(null);
      toast.success('Category updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await categoryService.deleteCategory(selectedCategory.id);
      setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      setShowDeleteModal(false);
      setSelectedCategory(null);
      
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Category Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryName">
                  Category Name
                </label>
                <input
                  id="categoryName"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryDescription">
                  Description (Optional)
                </label>
                <textarea
                  id="categoryDescription"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  rows="3"
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {editingCategory ? 'Update' : 'Add'}
                </button>
                
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCategory('');
                      setCategoryDescription('');
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">{category.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{category.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{category.articleCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setNewCategory(category.name);
                              setCategoryDescription(category.description || '');
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            disabled={category.articleCount > 0}
                            title={category.articleCount > 0 ? 'Cannot delete category with articles' : 'Delete category'}
                          >
                            <FiTrash2 className={category.articleCount > 0 ? 'opacity-50 cursor-not-allowed' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No categories found. Add your first category!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete the category "{selectedCategory.name}"? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;