import React, { useState, useEffect } from 'react';
import { 
  FaImage, 
  FaPlus, 
  FaSpinner, 
  FaEdit, 
  FaTrash, 
  FaFutbol,
  FaCheckCircle,
  FaBook,
  FaPlane,
  FaQuestionCircle,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { momentAPI, bookAPI, cardAPI, chooseAPI, getImageUrl } from '../services/sportAPI';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Sport = () => {
  const [activeTab, setActiveTab] = useState('hero');

  // Hero Section State (Moment)
  const [heroes, setHeroes] = useState([]);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroMessage, setHeroMessage] = useState({ type: '', text: '' });
  const [heroForm, setHeroForm] = useState({
    title: '',
    description: '',
    images: [],
    existingImages: []
  });
  const [editingHeroId, setEditingHeroId] = useState(null);
  const [heroPreview, setHeroPreview] = useState([]);
  
  // Card Section State
  const [cards, setCards] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardMessage, setCardMessage] = useState({ type: '', text: '' });
  const [cardForm, setCardForm] = useState({
    mainHeading: 'Upcoming Mega Sports Events',
    subHeading: 'Catch the biggest tournaments happening around the world',
    cards: [
      { 
        title: '', 
        location: '', 
        image: null, 
        startDate: '', 
        endDate: '',
        pageType: 'cricketTournament'
      }
    ]
  });
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardPreviews, setCardPreviews] = useState([null]);
  
  // Book Section State
  const [books, setBooks] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookMessage, setBookMessage] = useState({ type: '', text: '' });
  const [bookForm, setBookForm] = useState({
    mainHeading: 'Why book with GLOBENGEL?',
    items: [{ title: '', description: '', image: null }]
  });
  const [editingBookId, setEditingBookId] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [bookItemPreviews, setBookItemPreviews] = useState([null]);
  
  // Choose Section State (Why Choose)
  const [chooses, setChooses] = useState([]);
  const [chooseLoading, setChooseLoading] = useState(false);
  const [chooseMessage, setChooseMessage] = useState({ type: '', text: '' });
  const [chooseForm, setChooseForm] = useState({
    mainHeading: 'Why Choose GLOBENGEL?',
    items: [{ title: '', description: '', image: null }]
  });
  const [editingChooseId, setEditingChooseId] = useState(null);
  const [chooseItemPreviews, setChooseItemPreviews] = useState([null]);

  // Cleanup for image previews
  useEffect(() => {
    return () => {
      heroPreview.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      bookItemPreviews.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      cardPreviews.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      chooseItemPreviews.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [heroPreview, bookItemPreviews, cardPreviews, chooseItemPreviews]);

  // Fetch Hero Data (Moment API)
  useEffect(() => {
    const fetchHeroes = async () => {
      setHeroLoading(true);
      try {
        const data = await momentAPI.getAll();
        setHeroes(data);
        setHeroMessage({ type: '', text: '' });
      } catch (error) {
        setHeroMessage({ type: 'error', text: 'Failed to fetch hero data' });
      } finally {
        setHeroLoading(false);
      }
    };
    if (activeTab === 'hero') fetchHeroes();
  }, [activeTab]);
  
  // Fetch Book Data
  useEffect(() => {
    const fetchBooks = async () => {
      setBookLoading(true);
      try {
        const data = await bookAPI.getAll();
        setBooks(data);
        setBookMessage({ type: '', text: '' });
      } catch (error) {
        console.error('Error fetching book data:', error);
        setBookMessage({ type: 'error', text: 'Failed to fetch book data' });
      } finally {
        setBookLoading(false);
      }
    };
    if (activeTab === 'book') fetchBooks();
  }, [activeTab]);
  
  // Fetch Card Data
  useEffect(() => {
    const fetchCards = async () => {
      setCardLoading(true);
      try {
        const data = await cardAPI.getAll();
        setCards(data);
        setCardMessage({ type: '', text: '' });
      } catch (error) {
        console.error('Error fetching card data:', error);
        setCardMessage({ type: 'error', text: 'Failed to fetch card data' });
      } finally {
        setCardLoading(false);
      }
    };
    if (activeTab === 'card') fetchCards();
  }, [activeTab]);
  
  // Fetch Choose Data
  useEffect(() => {
    const fetchChooses = async () => {
      setChooseLoading(true);
      try {
        const data = await chooseAPI.getAll();
        setChooses(data);
        setChooseMessage({ type: '', text: '' });
      } catch (error) {
        console.error('Error fetching choose data:', error);
        setChooseMessage({ type: 'error', text: 'Failed to fetch choose data' });
      } finally {
        setChooseLoading(false);
      }
    };
    if (activeTab === 'choose') fetchChooses();
  }, [activeTab]);

  // Hero Form Handlers
  const handleHeroInputChange = (e) => {
    const { name, value } = e.target;
    setHeroForm(prev => ({ ...prev, [name]: value }));
  };
  const handleHeroImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    console.log('Selected files:', files); // Debug log
    
    if (editingHeroId) {
      // In edit mode, add new images to existing ones
      setHeroForm(prev => ({ 
        ...prev, 
        images: [...prev.images, ...files] 
      }));
      
      // Add new previews to existing ones
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setHeroPreview(prev => [...prev, ...newPreviews]);
    } else {
      // In create mode, replace all images
      setHeroForm(prev => ({ ...prev, images: files }));
      
      // Create preview URLs for all selected files
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setHeroPreview(previewUrls);
    }
  };

  const removeHeroImage = (index) => {
    // Remove image from form
    const updatedImages = heroForm.images.filter((_, i) => i !== index);
    setHeroForm(prev => ({ ...prev, images: updatedImages }));
    
    // Clean up preview URL and remove from previews
    if (heroPreview[index] && heroPreview[index].startsWith('blob:')) {
      URL.revokeObjectURL(heroPreview[index]);
    }
    const updatedPreviews = heroPreview.filter((_, i) => i !== index);
    setHeroPreview(updatedPreviews);
  };
  const resetHeroForm = () => {
    // Clean up any existing preview URLs to prevent memory leaks
    heroPreview.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    setHeroForm({ title: '', description: '', images: [], existingImages: [] });
    setEditingHeroId(null);
    setHeroPreview([]);
    setHeroMessage({ type: '', text: '' });
    
    // Clear file input
    const fileInput = document.getElementById('images');
    if (fileInput) fileInput.value = '';
  };
  const handleEditHero = (hero) => {
    setHeroForm({
      title: hero.title || '',
      description: hero.description || '',
      images: [], // Start with empty array for new images
      existingImages: Array.isArray(hero.image) ? hero.image : (hero.image ? [hero.image] : []) // Store existing images separately
    });
    setEditingHeroId(hero._id);
    // Show existing images in preview
    const existingPreviews = Array.isArray(hero.image) ? hero.image.map(img => getImageUrl(img)) : (hero.image ? [getImageUrl(hero.image)] : []);
    setHeroPreview(existingPreviews);
  };
  const handleSubmitHero = async (e) => {
    e.preventDefault();
    setHeroLoading(true);
    setHeroMessage({ type: '', text: '' });
    try {
      // Pass the heroForm object directly to the API functions
      // The API functions will handle creating the FormData
      if (editingHeroId) {
        await momentAPI.update(editingHeroId, heroForm);
        setHeroMessage({ type: 'success', text: 'Hero updated successfully' });
        toast.success('Hero updated successfully');
      } else {
        await momentAPI.create(heroForm);
        setHeroMessage({ type: 'success', text: 'Hero created successfully' });
        toast.success('Hero created successfully');
      }
      const data = await momentAPI.getAll();
      setHeroes(data);
      resetHeroForm();
    } catch (error) {
      const errorMessage = error.message || 'Failed to save hero';
      setHeroMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setHeroLoading(false);
    }
  };
  const handleDeleteHero = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero?')) return;
    setHeroLoading(true);
    try {
      await momentAPI.delete(id);
      setHeroes(heroes.filter(hero => hero._id !== id));
      setHeroMessage({ type: 'success', text: 'Hero deleted successfully' });
      toast.success('Hero deleted successfully');
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete hero';
      setHeroMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setHeroLoading(false);
    }
  };
  
  // Book Form Handlers
  const handleBookHeadingChange = (e) => {
    const { value } = e.target;
    setBookForm(prev => ({ ...prev, mainHeading: value }));
  };
  
  const handleBookItemChange = (index, field, value) => {
    const updatedItems = [...bookForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setBookForm(prev => ({ ...prev, items: updatedItems }));
  };
  
  const handleBookItemImageChange = (index, e) => {
    const file = e.target.files[0];
    const updatedItems = [...bookForm.items];
    updatedItems[index] = { ...updatedItems[index], image: file };
    
    const updatedPreviews = [...bookItemPreviews];
    updatedPreviews[index] = URL.createObjectURL(file);
    
    setBookForm(prev => ({ ...prev, items: updatedItems }));
    setBookItemPreviews(updatedPreviews);
  };
  
  const addBookItem = () => {
    setBookForm(prev => ({
      ...prev,
      items: [...prev.items, { title: '', description: '', image: null }]
    }));
    setBookItemPreviews(prev => [...prev, null]);
  };
  
  const removeBookItem = (index) => {
    if (bookForm.items.length <= 1) return; // Keep at least one item
    
    const updatedItems = bookForm.items.filter((_, i) => i !== index);
    const updatedPreviews = bookItemPreviews.filter((_, i) => i !== index);
    
    setBookForm(prev => ({ ...prev, items: updatedItems }));
    setBookItemPreviews(updatedPreviews);
  };
  
  const resetBookForm = () => {
    setBookForm({
      mainHeading: 'Why book with GLOBENGEL?',
      items: [{ title: '', description: '', image: null }]
    });
    setEditingBookId(null);
    setEditingItemIndex(null);
    setBookItemPreviews([null]);
    setBookMessage({ type: '', text: '' });
  };
  
  const handleCancelBookEdit = () => {
    resetBookForm();
  };
  
  const handleEditBook = (book) => {
    const itemsWithImages = book.items.map(item => ({
      title: item.title || '',
      description: item.description || '',
      image: item.image, // Preserve existing image
      _id: item._id
    }));
    
    setBookForm({
      mainHeading: book.mainHeading || 'Why book with GLOBENGEL?',
      items: itemsWithImages
    });
    
    setBookItemPreviews(book.items.map(item => getImageUrl(item.image)));
    setEditingBookId(book._id);
  };
  
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookLoading(true);
    setBookMessage({ type: '', text: '' });
    
    try {
      // Pass the bookForm object directly to the API functions
      // The API functions will handle creating the FormData
      if (editingBookId) {
        await bookAPI.update(editingBookId, bookForm);
        setBookMessage({ type: 'success', text: 'Book section updated successfully' });
        toast.success('Book section updated successfully');
      } else {
        await bookAPI.create(bookForm);
        setBookMessage({ type: 'success', text: 'Book section created successfully' });
        toast.success('Book section created successfully');
      }
      
      const data = await bookAPI.getAll();
      setBooks(data);
      resetBookForm();
    } catch (error) {
      console.error('Error saving book section:', error);
      const errorMessage = error.message || 'Failed to save book section';
      setBookMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setBookLoading(false);
    }
  };
  
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book section?')) return;
    
    setBookLoading(true);
    try {
      await bookAPI.delete(id);
      setBooks(books.filter(book => book._id !== id));
      setBookMessage({ type: 'success', text: 'Book section deleted successfully' });
      toast.success('Book section deleted successfully');
    } catch (error) {
      console.error('Error deleting book section:', error);
      const errorMessage = error.message || 'Failed to delete book section';
      setBookMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setBookLoading(false);
    }
  };
  
  // Card Form Handlers
  const handleCardHeadingChange = (field, value) => {
    setCardForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCardItemChange = (index, field, value) => {
    const updatedCards = [...cardForm.cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };

    if (field === 'startDate' || field === 'endDate') {
      const startDate = new Date(updatedCards[index].startDate);
      const endDate = new Date(updatedCards[index].endDate);
      if (startDate && endDate && endDate < startDate) {
        setCardMessage({ type: 'error', text: 'End date must be after start date' });
        return;
      }
    }

    setCardForm(prev => ({ ...prev, cards: updatedCards }));
    setCardMessage({ type: '', text: '' });
  };
  
  const handleCardItemImageChange = (index, e) => {
    const file = e.target.files[0];
    const updatedCards = [...cardForm.cards];
    updatedCards[index] = { ...updatedCards[index], image: file };
    
    const updatedPreviews = [...cardPreviews];
    updatedPreviews[index] = URL.createObjectURL(file);
    
    setCardForm(prev => ({ ...prev, cards: updatedCards }));
    setCardPreviews(updatedPreviews);
  };
  
  const handlePageTypeChange = (index, value) => {
    const updatedCards = [...cardForm.cards];
    updatedCards[index] = { ...updatedCards[index], pageType: value };
    setCardForm(prev => ({ ...prev, cards: updatedCards }));
  };
  
  const addCardItem = () => {
    setCardForm(prev => ({
      ...prev,
      cards: [
        ...prev.cards, 
        { 
          title: '', 
          location: '', 
          image: null, 
          startDate: '', 
          endDate: '',
          pageType: 'cricketTournament'
        }
      ]
    }));
    setCardPreviews(prev => [...prev, null]);
  };
  
  const removeCardItem = (index) => {
    if (cardForm.cards.length <= 1) return;
    
    const updatedCards = cardForm.cards.filter((_, i) => i !== index);
    const updatedPreviews = cardPreviews.filter((_, i) => i !== index);
    
    setCardForm(prev => ({ ...prev, cards: updatedCards }));
    setCardPreviews(updatedPreviews);
  };
  
  const resetCardForm = () => {
    setCardForm({
      mainHeading: 'Upcoming Mega Sports Events',
      subHeading: 'Catch the biggest tournaments happening around the world',
      cards: [
        { 
          title: '', 
          location: '', 
          image: null, 
          startDate: '', 
          endDate: '',
          pageType: 'cricketTournament'
        }
      ]
    });
    setEditingCardId(null);
    setCardPreviews([null]);
    setCardMessage({ type: '', text: '' });
  };
  
  const handleCancelCardEdit = () => {
    resetCardForm();
  };
  
  const handleEditCard = (card) => {
    const cardsWithImages = card.cards.map(item => ({
      title: item.title || '',
      location: item.location || '',
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      pageType: item.pageType || 'cricketTournament',
      image: item.image, // Preserve existing image
      _id: item._id
    }));
    
    setCardForm({
      mainHeading: card.mainHeading || 'Upcoming Mega Sports Events',
      subHeading: card.subHeading || 'Catch the biggest tournaments happening around the world',
      cards: cardsWithImages
    });
    
    setCardPreviews(card.cards.map(item => getImageUrl(item.image)));
    setEditingCardId(card._id);
  };
  
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setCardLoading(true);
    setCardMessage({ type: '', text: '' });
    
    try {
      // Pass the cardForm object directly to the API functions
      // The API functions will handle creating the FormData
      if (editingCardId) {
        await cardAPI.update(editingCardId, cardForm);
        setCardMessage({ type: 'success', text: 'Events section updated successfully' });
        toast.success('Events section updated successfully');
      } else {
        await cardAPI.create(cardForm);
        setCardMessage({ type: 'success', text: 'Events section created successfully' });
        toast.success('Events section created successfully');
      }
      
      const data = await cardAPI.getAll();
      setCards(data);
      resetCardForm();
    } catch (error) {
      console.error('Error saving events section:', error);
      const errorMessage = error.message || 'Failed to save events section';
      setCardMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setCardLoading(false);
    }
  };
  
  const handleDeleteCard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this events section?')) return;
    
    setCardLoading(true);
    try {
      await cardAPI.delete(id);
      setCards(cards.filter(card => card._id !== id));
      setCardMessage({ type: 'success', text: 'Events section deleted successfully' });
      toast.success('Events section deleted successfully');
    } catch (error) {
      console.error('Error deleting events section:', error);
      const errorMessage = error.message || 'Failed to delete events section';
      setCardMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setCardLoading(false);
    }
  };

  // Choose Form Handlers (Why Choose Section)
  const handleChooseHeadingChange = (value) => {
    setChooseForm(prev => ({ ...prev, mainHeading: value }));
  };
  
  const handleChooseItemChange = (index, field, value) => {
    const updatedItems = [...chooseForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setChooseForm(prev => ({ ...prev, items: updatedItems }));
  };
  
  const handleChooseItemImageChange = (index, e) => {
    const file = e.target.files[0];
    const updatedItems = [...chooseForm.items];
    updatedItems[index] = { ...updatedItems[index], image: file };
    
    const updatedPreviews = [...chooseItemPreviews];
    updatedPreviews[index] = URL.createObjectURL(file);
    
    setChooseForm(prev => ({ ...prev, items: updatedItems }));
    setChooseItemPreviews(updatedPreviews);
  };
  
  const addChooseItem = () => {
    setChooseForm(prev => ({
      ...prev,
      items: [...prev.items, { title: '', description: '', image: null }]
    }));
    setChooseItemPreviews(prev => [...prev, null]);
  };
  
  const removeChooseItem = (index) => {
    if (chooseForm.items.length <= 1) return;
    
    const updatedItems = chooseForm.items.filter((_, i) => i !== index);
    const updatedPreviews = chooseItemPreviews.filter((_, i) => i !== index);
    
    setChooseForm(prev => ({ ...prev, items: updatedItems }));
    setChooseItemPreviews(updatedPreviews);
  };
  
  const resetChooseForm = () => {
    setChooseForm({
      mainHeading: 'Why Choose GLOBENGEL?',
      items: [{ title: '', description: '', image: null }]
    });
    setEditingChooseId(null);
    setChooseItemPreviews([null]);
    setChooseMessage({ type: '', text: '' });
  };
  
  const handleCancelChooseEdit = () => {
    resetChooseForm();
  };
  
  const handleEditChoose = (choose) => {
    const itemsWithImages = choose.items.map(item => ({
      title: item.title || '',
      description: item.description || '',
      image: item.image, // Preserve existing image
      _id: item._id
    }));
    
    setChooseForm({
      mainHeading: choose.mainHeading || 'Why Choose GLOBENGEL?',
      items: itemsWithImages
    });
    
    setChooseItemPreviews(choose.items.map(item => getImageUrl(item.image)));
    setEditingChooseId(choose._id);
  };
  
  const handleChooseSubmit = async (e) => {
    e.preventDefault();
    setChooseLoading(true);
    setChooseMessage({ type: '', text: '' });
    
    try {
      // Pass the chooseForm object directly to the API functions
      // The API functions will handle creating the FormData
      if (editingChooseId) {
        await chooseAPI.update(editingChooseId, chooseForm);
        setChooseMessage({ type: 'success', text: 'Why Choose section updated successfully' });
        toast.success('Why Choose section updated successfully');
      } else {
        await chooseAPI.create(chooseForm);
        setChooseMessage({ type: 'success', text: 'Why Choose section created successfully' });
        toast.success('Why Choose section created successfully');
      }
      
      const data = await chooseAPI.getAll();
      setChooses(data);
      resetChooseForm();
    } catch (error) {
      console.error('Error saving Why Choose section:', error);
      const errorMessage = error.message || 'Failed to save Why Choose section';
      setChooseMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setChooseLoading(false);
    }
  };
  
  const handleDeleteChoose = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Why Choose section?')) return;
    
    setChooseLoading(true);
    try {
      await chooseAPI.delete(id);
      setChooses(chooses.filter(choose => choose._id !== id));
      setChooseMessage({ type: 'success', text: 'Why Choose section deleted successfully' });
      toast.success('Why Choose section deleted successfully');
    } catch (error) {
      console.error('Error deleting Why Choose section:', error);
      const errorMessage = error.message || 'Failed to delete Why Choose section';
      setChooseMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setChooseLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        <FaFutbol className="inline-block mr-2 mb-1" />
        Sport Management
      </h1>
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button className={`py-2 px-4 mr-2 ${activeTab === 'hero' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-500'}`} onClick={() => setActiveTab('hero')}>Hero Section</button>
        <button className={`py-2 px-4 mr-2 ${activeTab === 'card' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-500'}`} onClick={() => setActiveTab('card')}>
          <FaPlane className="inline-block mr-1 mb-1" />Cards
        </button>
        <button className={`py-2 px-4 mr-2 ${activeTab === 'book' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-500'}`} onClick={() => setActiveTab('book')}>
          <FaBook className="inline-block mr-1 mb-1" />Book
        </button>
        <button className={`py-2 px-4 ${activeTab === 'choose' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-gray-500'}`} onClick={() => setActiveTab('choose')}>
          <FaQuestionCircle className="inline-block mr-1 mb-1" />Why Choose
        </button>
      </div>
      {/* Hero Section */}
      {activeTab === 'hero' && (
        <div>
          {heroes.length > 0 && heroes[0] && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 overflow-hidden">
              <h2 className="text-2xl font-semibold mb-4">Hero Preview</h2>
              <div className="relative overflow-hidden rounded-lg" style={{ height: '400px' }}>
                {heroes[0].image && Array.isArray(heroes[0].image) && heroes[0].image.length > 0 && (
                  <img 
                    src={getImageUrl(heroes[0].image[0])} 
                    alt={heroes[0].title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h1 className="text-4xl font-bold mb-4">{heroes[0].title}</h1>
                    <p className="text-lg mb-6 max-w-2xl">
                      {heroes[0].description}
                    </p>
                    <div className="flex mt-4 space-x-4">
                      {heroes[0].image && Array.isArray(heroes[0].image) && heroes[0].image.slice(0, 4).map((img, index) => (
                        <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white">
                          <img 
                            src={getImageUrl(img)} 
                            alt={`Thumbnail ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {heroes[0].image && Array.isArray(heroes[0].image) && heroes[0].image.length > 4 && (
                        <div className="w-16 h-16 rounded-lg bg-black bg-opacity-50 border-2 border-white flex items-center justify-center text-white">
                          +{heroes[0].image.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">{editingHeroId ? 'Edit Hero' : 'Add New Hero'}</h2>
            {heroMessage.text && (
              <div className={`p-3 mb-4 rounded ${heroMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{heroMessage.text}</div>
            )}
            <form onSubmit={handleSubmitHero}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="title">Title</label>
                <input type="text" id="title" name="title" value={heroForm.title} onChange={handleHeroInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="description">Description</label>
                <textarea id="description" name="description" value={heroForm.description} onChange={handleHeroInputChange} className="w-full p-2 border rounded" rows="3" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="images">
                  Images {editingHeroId ? '(Select to add more images)' : '(Select multiple images)'}
                </label>
                <input 
                  type="file" 
                  id="images" 
                  name="images" 
                  onChange={handleHeroImageChange} 
                  className="w-full p-2 border rounded" 
                  accept="image/*" 
                  multiple 
                  required={!editingHeroId && heroForm.images.length === 0}
                />
                {heroForm.images && heroForm.images.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {heroForm.images.length} file(s) selected
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl (or Cmd on Mac) to select multiple images at once
                </p>
              </div>
              {heroPreview.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-700 mb-2">Image Preview:</p>
                  <div className="flex flex-wrap gap-2">
                    {heroPreview.map((src, index) => {
                      const isExisting = editingHeroId && heroForm.existingImages && index < heroForm.existingImages.length;
                      return (
                        <div key={index} className="relative">
                          <img 
                            src={src} 
                            alt={`Preview ${index + 1}`} 
                            className={`w-24 h-24 object-cover rounded border-2 ${isExisting ? 'border-green-400' : 'border-blue-400'}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeHeroImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            title="Remove image"
                          >
                            ×
                          </button>
                          <div className={`absolute bottom-0 left-0 right-0 text-white text-xs text-center py-1 ${isExisting ? 'bg-green-600 bg-opacity-80' : 'bg-blue-600 bg-opacity-80'}`}>
                            {index + 1} {isExisting ? '(existing)' : '(new)'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {editingHeroId && (
                    <p className="text-xs text-gray-600 mt-2">
                      <span className="inline-block w-3 h-3 bg-green-400 rounded mr-1"></span>
                      Existing images
                      <span className="inline-block w-3 h-3 bg-blue-400 rounded mr-1 ml-4"></span>
                      New images to add
                    </p>
                  )}
                  {heroForm.images.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Reset file input to allow selecting more images
                          document.getElementById('images').value = '';
                        }}
                        className="text-blue-500 text-sm hover:text-blue-700"
                      >
                        + Add more images
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Clear all images
                          heroPreview.forEach(url => {
                            if (url && url.startsWith('blob:')) {
                              URL.revokeObjectURL(url);
                            }
                          });
                          setHeroForm(prev => ({ ...prev, images: [] }));
                          setHeroPreview([]);
                          document.getElementById('images').value = '';
                        }}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center mt-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 flex items-center" disabled={heroLoading}>
                  {heroLoading ? (<FaSpinner className="animate-spin mr-2" />) : (<FaCheckCircle className="mr-2" />)}
                  {editingHeroId ? 'Update Hero' : 'Save Hero'}
                </button>
                {editingHeroId && (
                  <button type="button" onClick={resetHeroForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                )}
              </div>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Hero Sections</h2>
            {heroLoading && !heroForm.title ? (
              <div className="flex justify-center my-8"><FaSpinner className="animate-spin text-blue-500 text-4xl" /></div>
            ) : heroes.length === 0 ? (
              <p className="text-gray-500 my-4">No hero sections found. Add one to get started.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroes.map(hero => (
                  <div key={hero._id} className="border rounded-lg overflow-hidden shadow-lg">
                    {hero.image && Array.isArray(hero.image) && hero.image.length > 0 ? (
                      <div className="relative h-64 overflow-hidden bg-gray-100">
                        <div className="flex overflow-x-auto snap-x">
                          {hero.image.map((img, index) => (
                            <div key={index} className="snap-start flex-shrink-0 w-full h-64 relative">
                              <img 
                                src={getImageUrl(img)} 
                                alt={`${hero.title} - Image ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                                {index + 1}/{hero.image.length}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 bg-gray-200 flex items-center justify-center">
                        <FaImage className="text-gray-400 text-5xl" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-xl mb-2">{hero.title}</h3>
                      <p className="text-gray-700 mb-4">{hero.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          {Array.isArray(hero.image) && (
                            <span className="text-gray-500 text-sm">{hero.image.length} images</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditHero(hero)} className="text-blue-500 hover:text-blue-700 p-1"><FaEdit /></button>
                          <button onClick={() => handleDeleteHero(hero._id)} className="text-red-500 hover:text-red-700 p-1"><FaTrash /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'book' && (
        <div>
          {books.length > 0 && books[0] && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold mb-4">Book Section Preview</h2>
              <div className="p-4 border rounded-lg">
                <h3 className="text-xl font-bold text-center mb-6">{books[0].mainHeading}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {books[0].items && books[0].items.map((item, index) => (
                    <div key={index} className="text-center">
                      {item.image && (
                        <div className="flex justify-center mb-3">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500">
                            <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                      <h4 className="font-bold mb-2">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">{editingBookId ? 'Edit Book Section' : 'Add New Book Section'}</h2>
            {bookMessage.text && (
              <div className={`p-3 mb-4 rounded ${bookMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{bookMessage.text}</div>
            )}
            <form onSubmit={handleBookSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="mainHeading">Main Heading</label>
                <input 
                  type="text" 
                  id="mainHeading" 
                  name="mainHeading" 
                  value={bookForm.mainHeading} 
                  onChange={handleBookHeadingChange} 
                  className="w-full p-2 border rounded" 
                  required 
                />
              </div>
              
              <h3 className="text-lg font-semibold mb-3 mt-6">Book Items</h3>
              {bookForm.items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg mb-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <button 
                      type="button" 
                      onClick={() => removeBookItem(index)} 
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600" 
                      disabled={bookForm.items.length <= 1}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Title</label>
                    <input 
                      type="text" 
                      value={item.title} 
                      onChange={(e) => handleBookItemChange(index, 'title', e.target.value)} 
                      className="w-full p-2 border rounded" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Description</label>
                    <textarea 
                      value={item.description} 
                      onChange={(e) => handleBookItemChange(index, 'description', e.target.value)} 
                      className="w-full p-2 border rounded" 
                      rows="2" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Image {editingBookId && '(Leave empty to keep current image)'}</label>
                    <input 
                      type="file" 
                      onChange={(e) => handleBookItemImageChange(index, e)} 
                      className="w-full p-2 border rounded" 
                      accept="image/*" 
                      required={!editingBookId && !bookItemPreviews[index]} 
                    />
                  </div>
                  
                  {bookItemPreviews[index] && (
                    <div className="mt-2">
                      <p className="text-gray-700 mb-1">Image Preview:</p>
                      <img 
                        src={bookItemPreviews[index]} 
                        alt={`Item ${index + 1} Preview`} 
                        className="w-24 h-24 object-cover rounded border" 
                      />
                    </div>
                  )}
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={addBookItem} 
                className="bg-green-500 text-white px-4 py-2 rounded mb-6 hover:bg-green-600 flex items-center"
              >
                <FaPlus className="mr-2" /> Add Another Item
              </button>
              
              <div className="flex items-center mt-4">
                <button 
                  type="submit" 
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 flex items-center" 
                  disabled={bookLoading}
                >
                  {bookLoading ? (<FaSpinner className="animate-spin mr-2" />) : (<FaBook className="mr-2" />)}
                  {editingBookId ? 'Update Book Section' : 'Save Book Section'}
                </button>
                {editingBookId && (
                  <button 
                    type="button" 
                    onClick={handleCancelBookEdit} 
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Book Sections</h2>
            {bookLoading && !bookForm.items[0].title ? (
              <div className="flex justify-center my-8"><FaSpinner className="animate-spin text-blue-500 text-4xl" /></div>
            ) : books.length === 0 ? (
              <p className="text-gray-500 my-4">No book sections found. Add one to get started.</p>
            ) : (
              <div className="space-y-6">
                {books.map(book => (
                  <div key={book._id} className="border rounded-lg overflow-hidden shadow-md">
                    <div className="p-4 bg-blue-50">
                      <h3 className="font-bold text-xl mb-2">{book.mainHeading}</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {book.items && book.items.map((item, index) => (
                          <div key={index} className="border rounded p-3 flex items-start">
                            {item.image && (
                              <div className="mr-3 flex-shrink-0">
                                <img 
                                  src={getImageUrl(item.image)} 
                                  alt={item.title} 
                                  className="w-12 h-12 object-cover rounded-full border" 
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold">{item.title}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 border-t flex justify-end space-x-2">
                      <button onClick={() => handleEditBook(book)} className="text-blue-500 hover:text-blue-700 p-1"><FaEdit /></button>
                      <button onClick={() => handleDeleteBook(book._id)} className="text-red-500 hover:text-red-700 p-1"><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'card' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-800">
              <FaPlane className="inline-block mr-2 mb-1" />
              Sports Events Section
            </h2>
          </div>
          
          <form onSubmit={handleCardSubmit} className="mb-8 border p-4 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">
              {editingCardId ? 'Edit Events Section' : 'Add New Events Section'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={cardForm.mainHeading}
                onChange={(e) => handleCardHeadingChange('mainHeading', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Upcoming Mega Sports Events"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Sub Heading</label>
              <input
                type="text"
                value={cardForm.subHeading}
                onChange={(e) => handleCardHeadingChange('subHeading', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Catch the biggest tournaments happening around the world"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700">Event Cards</label>
                <button
                  type="button"
                  onClick={addCardItem}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Event
                </button>
              </div>
              
              {cardForm.cards.map((card, index) => (
                <div key={index} className="border p-3 rounded-lg mb-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Event {index + 1}</h4>
                    {cardForm.cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCardItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-gray-700 mb-1 text-sm">Title</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => handleCardItemChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., FIFA World Cup 2026"
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-gray-700 mb-1 text-sm">Location</label>
                    <input
                      type="text"
                      value={card.location}
                      onChange={(e) => handleCardItemChange(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., USA · Canada · Mexico"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Start Date</label>
                      <input
                        type="date"
                        value={card.startDate}
                        onChange={(e) => handleCardItemChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">End Date</label>
                      <input
                        type="date"
                        value={card.endDate}
                        onChange={(e) => handleCardItemChange(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-gray-700 mb-1 text-sm">Page Type</label>
                    <select
                      value={card.pageType}
                      onChange={(e) => handlePageTypeChange(index, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="cricketTournament">Cricket Tournament</option>
                      <option value="footballTournament">Football Tournament</option>
                      <option value="motoGPTournament">MotoGP Tournament</option>
                      <option value="f1Schedule">F1 Schedule</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">Image</label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        onChange={(e) => handleCardItemImageChange(index, e)}
                        className="hidden"
                        id={`card-item-image-${index}`}
                        accept="image/*"
                      />
                      <label
                        htmlFor={`card-item-image-${index}`}
                        className="cursor-pointer bg-blue-50 text-blue-500 px-3 py-2 rounded-lg border border-blue-200 flex items-center"
                      >
                        <FaImage className="mr-2" /> {card.image ? 'Change Image' : 'Select Image'}
                      </label>
                      {cardPreviews[index] && (
                        <div className="ml-3 h-10 w-10 rounded overflow-hidden">
                          <img
                            src={cardPreviews[index]}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4 space-x-3">
              {editingCardId && (
                <button
                  type="button"
                  onClick={handleCancelCardEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={cardLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
              >
                {cardLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-2" />
                    {editingCardId ? 'Update' : 'Save'}
                  </>
                )}
              </button>
            </div>
            
            {cardMessage.text && (
              <div className={`mt-4 p-3 rounded-lg ${cardMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {cardMessage.text}
              </div>
            )}
          </form>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">Existing Events Sections</h3>
            
            {cardLoading ? (
              <div className="text-center py-6">
                <FaSpinner className="animate-spin inline-block text-3xl text-blue-500" />
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No event sections found. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cards.map((card) => (
                  <div key={card._id} className="border rounded-lg overflow-hidden bg-white">
                    <div className="bg-gray-50 p-4 border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg text-blue-800">{card.mainHeading}</h3>
                          <p className="text-gray-600">{card.subHeading}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditCard(card)} className="text-blue-500 hover:text-blue-700 p-1">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDeleteCard(card._id)} className="text-red-500 hover:text-red-700 p-1">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {card.cards.map((item) => (
                          <div key={item._id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                            {item.image && (
                              <div className="h-40 overflow-hidden">
                                <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="p-3">
                              <h4 className="font-semibold text-md mb-1">{item.title}</h4>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <FaMapMarkerAlt className="mr-1 text-blue-500" /> {item.location}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                              </div>
                              <div className="mt-2">
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {item.pageType}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'choose' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-800">
              <FaQuestionCircle className="inline-block mr-2 mb-1" />
              Why Choose Section
            </h2>
          </div>
          
          <form onSubmit={handleChooseSubmit} className="mb-8 border p-4 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">
              {editingChooseId ? 'Edit Why Choose Section' : 'Add New Why Choose Section'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={chooseForm.mainHeading}
                onChange={(e) => handleChooseHeadingChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Choose How You Experience the Game?"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700">Items</label>
                <button
                  type="button"
                  onClick={addChooseItem}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Item
                </button>
              </div>
              
              {chooseForm.items.map((item, index) => (
                <div key={index} className="border p-3 rounded-lg mb-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {chooseForm.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChooseItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-gray-700 mb-1 text-sm">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleChooseItemChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., Paddock Club/Hospitality"
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-gray-700 mb-1 text-sm">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleChooseItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., Ultimate VIP lounge, fine dining, and exclusive access."
                      rows="2"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">Image</label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        onChange={(e) => handleChooseItemImageChange(index, e)}
                        className="hidden"
                        id={`choose-item-image-${index}`}
                        accept="image/*"
                      />
                      <label
                        htmlFor={`choose-item-image-${index}`}
                        className="cursor-pointer bg-blue-50 text-blue-500 px-3 py-2 rounded-lg border border-blue-200 flex items-center"
                      >
                        <FaImage className="mr-2" /> {item.image ? 'Change Image' : 'Select Image'}
                      </label>
                      {chooseItemPreviews[index] && (
                        <div className="ml-3 h-10 w-10 rounded overflow-hidden">
                          <img
                            src={chooseItemPreviews[index]}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4 space-x-3">
              {editingChooseId && (
                <button
                  type="button"
                  onClick={handleCancelChooseEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={chooseLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
              >
                {chooseLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-2" />
                    {editingChooseId ? 'Update' : 'Save'}
                  </>
                )}
              </button>
            </div>
            
            {chooseMessage.text && (
              <div className={`mt-4 p-3 rounded-lg ${chooseMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {chooseMessage.text}
              </div>
            )}
          </form>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">Existing Why Choose Sections</h3>
            
            {chooseLoading ? (
              <div className="text-center py-6">
                <FaSpinner className="animate-spin inline-block text-3xl text-blue-500" />
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : chooses.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No Why Choose sections found. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {chooses.map((choose) => (
                  <div key={choose._id} className="border rounded-lg overflow-hidden bg-white">
                    <div className="bg-gray-50 p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-blue-800">{choose.mainHeading}</h3>
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditChoose(choose)} className="text-blue-500 hover:text-blue-700 p-1">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDeleteChoose(choose._id)} className="text-red-500 hover:text-red-700 p-1">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {choose.items.map((item) => (
                          <div key={item._id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                            {item.image && (
                              <div className="h-40 overflow-hidden">
                                <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="p-3">
                              <h4 className="font-semibold text-md mb-1">{item.title}</h4>
                              <p className="text-gray-600 text-sm">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sport;