import { useState, useEffect } from 'react'
import { Building2, Search, MapPin, X, Plus } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import AdminDashboard from './AdminDashboard'
import { SellerDashboard } from './SellerDashboard'

function AppContent() {
  const { user, signIn, signUp, signOut } = useAuth()
  const [currentPage, setCurrentPage] = useState<'home' | 'browse' | 'admin' | 'seller'>('home')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [postAdModalOpen, setPostAdModalOpen] = useState(false)
  const [postAdLoading, setPostAdLoading] = useState(false)
  const [postAdError, setPostAdError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [realAds, setRealAds] = useState<any[]>([])
  const [adsLoading, setAdsLoading] = useState(false)
  const [adsError, setAdsError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')


  // Handle login
  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true)
    setAuthError('')
    
    const { error } = await signIn(email, password)
    
    if (error) {
      setAuthError(error.message)
    } else {
      setAuthModalOpen(false)
    }
    
    setAuthLoading(false)
  }

  // Handle registration
  const handleRegister = async (email: string, password: string, fullName: string, role: 'seller' | 'buyer') => {
    setAuthLoading(true)
    setAuthError('')
    
    const { error } = await signUp(email, password, { full_name: fullName, role })
    
    if (error) {
      setAuthError(error.message)
    } else {
      setAuthModalOpen(false)
    }
    
    setAuthLoading(false)
  }

  // Handle logout
  const handleLogout = async () => {
    await signOut()
  }

  // Fetch real ads from Supabase
  const fetchRealAds = async () => {
    setAdsLoading(true)
    setAdsError('')
    
    try {
      console.log('Fetching real ads from database...')
      
      // Add timeout to prevent hanging
      const fetchPromise = supabase
        .from('ads')
        .select(`
          *,
          users!ads_seller_id_fkey (
            full_name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Ads fetch timeout')), 8000)
      )
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        console.error('Ads fetch error:', error)
        throw error
      }

      console.log('Real ads fetched:', data)
      setRealAds(data || [])
    } catch (error: any) {
      console.error('Failed to fetch ads:', error)
      setAdsError(error.message || 'Failed to load ads')
      // Fallback to mock ads if real ads fail
      setRealAds([])
    } finally {
      setAdsLoading(false)
    }
  }

  // Handle post ad
  const handlePostAd = async (adData: {
    title: string
    description: string
    price: number
    category: string
    location: string
    contactPhone: string
    contactEmail: string
  }) => {
    if (!user) return

    setPostAdLoading(true)
    setPostAdError('')

    try {
      console.log('Starting ad post...', adData)
      
      // Add timeout to prevent hanging
      const insertPromise = supabase
        .from('ads')
        .insert([
          {
            seller_id: user.id,
            title: adData.title,
            description: adData.description,
            price: adData.price,
            category: adData.category,
            location: adData.location,
            contact_phone: adData.contactPhone,
            contact_email: adData.contactEmail,
            status: 'active'
          }
        ])
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Ad posting timeout - database may be unavailable')), 10000)
      )
      
      const { error } = await Promise.race([insertPromise, timeoutPromise]) as any

      if (error) {
        console.error('Ad post error:', error)
        throw error
      }

      console.log('Ad posted successfully!')
      setPostAdModalOpen(false)
      alert('Ad posted successfully!')
      
      // Refresh ads list after posting
      fetchRealAds()
    } catch (error: any) {
      console.error('Ad posting failed:', error)
      setPostAdError(error.message || 'Failed to post ad. Please try again.')
    } finally {
      setPostAdLoading(false)
    }
  }

  // Mock construction ads data (prices in PKR)
  const mockAds = [
    {
      id: '1',
      title: 'Premium Steel Beams - Grade A',
      description: 'High-quality structural steel beams perfect for commercial and residential construction projects.',
      price: 347500,
      category: 'Materials',
      location: 'Karachi, Sindh',
      seller: 'Karachi Steel Works',
      image: '🏗️',
      isPremium: false
    },
    {
      id: '2', 
      title: 'Industrial Concrete Mixer',
      description: 'Heavy-duty concrete mixer for large construction projects. Excellent condition, recently serviced.',
      price: 2365000,
      category: 'Equipment',
      location: 'Lahore, Punjab',
      seller: 'Punjab Construction Equipment',
      image: '🚛',
      isPremium: true
    },
    {
      id: '3',
      title: 'Professional Tool Set - 150 Pieces',
      description: 'Complete professional tool set including power tools, hand tools, and safety equipment.',
      price: 125000,
      category: 'Tools',
      location: 'Islamabad, ICT',
      seller: 'Capital Tools & Hardware',
      image: '🔧',
      isPremium: false
    },
    {
      id: '4',
      title: 'Safety Equipment Bundle',
      description: 'Complete safety package including hard hats, safety vests, gloves, and protective eyewear.',
      price: 34750,
      category: 'Safety',
      location: 'Rawalpindi, Punjab',
      seller: 'SafeWork Pakistan',
      image: '🦺',
      isPremium: true
    },
    {
      id: '5',
      title: 'High-Grade Cement - 50 Bags',
      description: 'Premium quality cement suitable for all types of construction. Fresh stock, best rates in the market.',
      price: 87500,
      category: 'Materials',
      location: 'Faisalabad, Punjab',
      seller: 'Faisalabad Cement Depot',
      image: '🏭',
      isPremium: false
    },
    {
      id: '6',
      title: 'Excavator JCB 3DX - Rental',
      description: 'Heavy-duty excavator available for rent. Perfect for digging, demolition, and earthmoving projects.',
      price: 15000,
      category: 'Equipment',
      location: 'Peshawar, KPK',
      seller: 'KPK Heavy Machinery',
      image: '🚜',
      isPremium: true
    },
    {
      id: '7',
      title: 'Ceramic Tiles - Premium Collection',
      description: 'Beautiful ceramic tiles for flooring and walls. Various designs and sizes available. Bulk discounts.',
      price: 2800,
      category: 'Materials',
      location: 'Multan, Punjab',
      seller: 'Multan Tiles & Ceramics',
      image: '🏺',
      isPremium: false
    },
    {
      id: '8',
      title: 'Scaffolding System - Complete Set',
      description: 'Professional scaffolding system for multi-story construction. Includes all brackets and safety equipment.',
      price: 275000,
      category: 'Equipment',
      location: 'Gujranwala, Punjab',
      seller: 'Gujranwala Scaffolding Co.',
      image: '🏗️',
      isPremium: false
    },
    {
      id: '9',
      title: 'Electrical Wiring Kit - Commercial',
      description: 'Complete electrical wiring solution for commercial buildings. Includes cables, switches, and fixtures.',
      price: 156000,
      category: 'Materials',
      location: 'Sialkot, Punjab',
      seller: 'Sialkot Electrical Supplies',
      image: '⚡',
      isPremium: true
    },
    {
      id: '10',
      title: 'Plumbing Pipes & Fittings Set',
      description: 'High-quality PVC and steel pipes with complete fittings. Suitable for residential and commercial use.',
      price: 67500,
      category: 'Materials',
      location: 'Hyderabad, Sindh',
      seller: 'Sindh Plumbing Solutions',
      image: '🔧',
      isPremium: false
    },
    {
      id: '11',
      title: 'Tower Crane - Heavy Duty',
      description: 'Professional tower crane for high-rise construction projects. Experienced operator included.',
      price: 450000,
      category: 'Equipment',
      location: 'Karachi, Sindh',
      seller: 'Karachi Crane Services',
      image: '🏗️',
      isPremium: true
    },
    {
      id: '12',
      title: 'Marble & Granite Slabs',
      description: 'Premium quality marble and granite slabs for luxury construction. Various colors and patterns available.',
      price: 89000,
      category: 'Materials',
      location: 'Quetta, Balochistan',
      seller: 'Balochistan Stone Works',
      image: '🪨',
      isPremium: false
    }
  ]

  // Helper function to get category icons
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'materials': return '🏗️'
      case 'equipment': return '🚛'
      case 'tools': return '🔧'
      case 'safety': return '🦺'
      default: return '🏢'
    }
  }

  // Use real ads if available, fallback to mock ads
  const adsToUse = realAds.length > 0 ? realAds : mockAds
  
  // Transform real ads to match mock ad format
  const transformedAds = adsToUse.map(ad => {
    if (ad.users) {
      // Real ad from database
      return {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        price: ad.price,
        category: ad.category,
        location: ad.location,
        seller: ad.users?.full_name || 'Unknown Seller',
        image: getCategoryIcon(ad.category),
        isPremium: false,
        contactPhone: ad.contact_phone,
        contactEmail: ad.contact_email
      }
    } else {
      // Mock ad
      return ad
    }
  })

  // Filter ads based on search and category
  const filteredAds = transformedAds.filter(ad => {
    const matchesSearch = searchQuery === '' || 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.seller.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || ad.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })
  


  // Auto-redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin' && currentPage !== 'admin') {
      console.log('Admin user detected - redirecting to admin dashboard')
      setCurrentPage('admin')
    }
  }, [user])

  // Fetch ads when component mounts or when switching to browse page
  useEffect(() => {
    if (currentPage === 'browse') {
      fetchRealAds()
    }
  }, [currentPage])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 style={{ height: '32px', width: '32px', color: '#2563eb' }} />
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Ebuild</span>
            </div>
            
            <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button 
                onClick={() => setCurrentPage('home')}
                style={{ 
                  color: currentPage === 'home' ? '#2563eb' : '#4b5563', 
                  fontWeight: currentPage === 'home' ? '600' : '400',
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentPage('browse')}
                style={{ 
                  color: currentPage === 'browse' ? '#2563eb' : '#4b5563', 
                  fontWeight: currentPage === 'browse' ? '600' : '400',
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                Browse
              </button>
              
              {/* Admin navigation - only show for admin users */}
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setCurrentPage('admin')}
                  style={{ 
                    color: currentPage === 'admin' ? '#dc2626' : '#4b5563', 
                    fontWeight: currentPage === 'admin' ? '600' : '400',
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer' 
                  }}
                >
                  Admin
                </button>
              )}
              
              {/* Seller Dashboard navigation - only show for sellers */}
              {user?.role === 'seller' && (
                <button 
                  onClick={() => setCurrentPage('seller')}
                  style={{ 
                    color: currentPage === 'seller' ? '#10b981' : '#4b5563', 
                    fontWeight: currentPage === 'seller' ? '600' : '400',
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer' 
                  }}
                >
                  Dashboard
                </button>
              )}
              
              {user ? (
                // Authenticated user menu
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#4b5563', fontSize: '14px' }}>
                    Welcome, {user.full_name}
                  </span>
                  <div style={{ 
                    backgroundColor: user.role === 'seller' ? '#10b981' : '#3b82f6', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {user.role.toUpperCase()}
                  </div>
                  
                  {/* Post Ad button for sellers only */}
                  {user.role === 'seller' && (
                    <button 
                      onClick={() => setPostAdModalOpen(true)}
                      style={{ 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      <Plus style={{ height: '16px', width: '16px' }} />
                      Post Ad
                    </button>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      color: '#4b5563', 
                      backgroundColor: 'transparent', 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px', 
                      borderRadius: '6px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                // Guest user buttons
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => {
                      setAuthMode('login')
                      setAuthModalOpen(true)
                    }}
                    style={{ 
                      color: '#4b5563', 
                      backgroundColor: 'transparent', 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px', 
                      borderRadius: '6px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      setAuthMode('register')
                      setAuthModalOpen(true)
                    }}
                    style={{ 
                      backgroundColor: '#2563eb', 
                      color: 'white', 
                      border: 'none', 
                      padding: '8px 16px', 
                      borderRadius: '6px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentPage === 'home' ? (
        <>
          {/* Hero Section */}
          <section style={{ 
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)', 
            color: 'white', 
            padding: '80px 0' 
          }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>
                  Pakistan's Premier Construction Marketplace
                </h1>
                <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
                  Welcome to Ebuild - Connect with trusted construction suppliers and contractors. Find quality materials, equipment, and services for your projects.
                </p>
                
                {/* Search Bar */}
                <div style={{ 
                  maxWidth: '672px', 
                  margin: '0 auto', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  padding: '8px', 
                  display: 'flex' 
                }}>
                  <input 
                    type="text" 
                    placeholder="Search for materials, tools, services..." 
                    style={{ 
                      flex: 1, 
                      padding: '12px 16px', 
                      color: '#111827', 
                      border: 'none', 
                      outline: 'none' 
                    }}
                  />
                  <button 
                    onClick={() => setCurrentPage('browse')}
                    style={{ 
                      backgroundColor: '#2563eb', 
                      color: 'white', 
                      padding: '12px 24px', 
                      borderRadius: '6px', 
                      border: 'none', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Search style={{ height: '20px', width: '20px' }} />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section style={{ padding: '64px 0' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                  Why Choose Ebuild?
                </h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '24px', 
                  borderRadius: '8px', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                  textAlign: 'center' 
                }}>
                  <div style={{ 
                    backgroundColor: '#fed7aa', 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 16px' 
                  }}>
                    <Building2 style={{ height: '32px', width: '32px', color: '#ea580c' }} />
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>For Sellers</h4>
                  <p style={{ color: '#4b5563' }}>
                    Showcase your products and services to thousands of potential buyers
                  </p>
                </div>
                
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '24px', 
                  borderRadius: '8px', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                  textAlign: 'center' 
                }}>
                  <div style={{ 
                    backgroundColor: '#dbeafe', 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 16px' 
                  }}>
                    <Search style={{ height: '32px', width: '32px', color: '#2563eb' }} />
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Easy Search</h4>
                  <p style={{ color: '#4b5563' }}>
                    Find exactly what you need with our powerful search and filters
                  </p>
                </div>
                
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '24px', 
                  borderRadius: '8px', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                  textAlign: 'center' 
                }}>
                  <div style={{ 
                    backgroundColor: '#dcfce7', 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 16px' 
                  }}>
                    <MapPin style={{ height: '32px', width: '32px', color: '#16a34a' }} />
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Local & Global</h4>
                  <p style={{ color: '#4b5563' }}>
                    Connect with suppliers in your area or expand your reach globally
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section style={{ backgroundColor: '#f3f4f6', padding: '64px 0' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>1,000+</div>
                  <div style={{ color: '#4b5563' }}>Active Sellers</div>
                </div>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>5,000+</div>
                  <div style={{ color: '#4b5563' }}>Products Listed</div>
                </div>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>50+</div>
                  <div style={{ color: '#4b5563' }}>Categories</div>
                </div>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>24/7</div>
                  <div style={{ color: '#4b5563' }}>Support</div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : currentPage === 'admin' && user?.role === 'admin' ? (
        <AdminDashboard 
          user={user} 
          onBackToHome={() => setCurrentPage('home')} 
        />
      ) : currentPage === 'seller' && user?.role === 'seller' ? (
        <SellerDashboard 
          user={user} 
          onBackToHome={() => setCurrentPage('home')} 
        />
      ) : (
        <div style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Browse Construction Ads</h2>
              <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '24px' }}>
                Find the best construction materials, equipment, and services
              </p>
              <button 
                onClick={() => setCurrentPage('home')}
                style={{ 
                  backgroundColor: '#f3f4f6', 
                  color: '#374151', 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                ← Back to Home
              </button>
            </div>

            {/* Search and Filter Section */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <input
                    type="text"
                    placeholder="Search ads by title, description, or seller..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="All">All Categories</option>
                    <option value="Materials">Materials</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Tools">Tools</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                  }}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Loading State */}
            {adsLoading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#6b7280' 
              }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>Loading ads...</div>
                <p>Fetching the latest construction ads from our database</p>
              </div>
            )}

            {/* Error State */}
            {adsError && !adsLoading && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '16px',
                borderRadius: '6px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Failed to load ads</div>
                <div style={{ fontSize: '14px' }}>{adsError}</div>
                <button 
                  onClick={fetchRealAds}
                  style={{
                    marginTop: '12px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results Count */}
            {!adsLoading && (
              <div style={{ marginBottom: '16px', color: '#6b7280' }}>
                {realAds.length > 0 ? (
                  <>Showing {filteredAds.length} of {transformedAds.length} real ads from database</>
                ) : (
                  <>Showing {filteredAds.length} of {transformedAds.length} ads (using demo data)</>
                )}
              </div>
            )}

            {/* Ads Grid */}
            {!adsLoading && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '24px' 
              }}>
                {filteredAds.length > 0 ? filteredAds.map(ad => (
                <div key={ad.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  border: ad.isPremium ? '2px solid #fbbf24' : '1px solid #e5e7eb'
                }}>
                  {ad.isPremium && (
                    <div style={{
                      backgroundColor: '#fbbf24',
                      color: 'white',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      ⭐ PREMIUM AD
                    </div>
                  )}
                  
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '32px', marginRight: '12px' }}>{ad.image}</span>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                          {ad.title}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>
                          by {ad.seller}
                        </p>
                      </div>
                    </div>

                    <p style={{ color: '#4b5563', marginBottom: '16px', lineHeight: '1.5' }}>
                      {ad.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                        PKR {ad.price.toLocaleString()}
                      </div>
                      <div style={{ 
                        backgroundColor: '#dbeafe', 
                        color: '#2563eb', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {ad.category}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', color: '#6b7280' }}>
                      <MapPin style={{ height: '16px', width: '16px', marginRight: '6px' }} />
                      <span style={{ fontSize: '14px' }}>{ad.location}</span>
                    </div>

                    <button style={{
                      width: '100%',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      Contact Seller
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '40px',
                  color: '#6b7280' 
                }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No ads found</h3>
                  <p>Try adjusting your search terms or filters</p>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '48px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 style={{ height: '24px', width: '24px', color: '#ea580c' }} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Ebuild</span>
            </div>
            <div style={{ color: '#9ca3af' }}>
              © 2024 Ebuild. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

          {/* Authentication Modal - Only show if user is not logged in */}
          {authModalOpen && !user && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            margin: '16px',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setAuthModalOpen(false)
                setAuthError('')
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <X style={{ height: '20px', width: '20px' }} />
            </button>

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>

            {authError && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {authError}
              </div>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault()
                console.log('Form submitted manually by user')
                const formData = new FormData(e.target as HTMLFormElement)
                const email = formData.get('email') as string
                const password = formData.get('password') as string
                
                console.log('Form submission data:', { email, password: password ? '***' : 'empty' })
                
                if (authMode === 'login') {
                  handleLogin(email, password)
                } else {
                  const fullName = formData.get('fullName') as string
                  const role = formData.get('role') as 'seller' | 'buyer'
                  handleRegister(email, password, fullName, role)
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  placeholder="Enter your password"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Account Type
                  </label>
                  <select
                    name="role"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="buyer">Buyer - Browse and purchase</option>
                    <option value="seller">Seller - Post ads and sell</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  backgroundColor: authLoading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  marginTop: '8px'
                }}
              >
                {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <span style={{ color: '#6b7280' }}>
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login')
                  setAuthError('')
                }}
                style={{
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {authMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Ad Modal */}
      {postAdModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            width: '100%',
            maxWidth: '600px',
            margin: '16px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => {
                setPostAdModalOpen(false)
                setPostAdError('')
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <X style={{ height: '20px', width: '20px' }} />
            </button>

            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '48px', textAlign: 'center', color: '#1f2937' }}>
              Why Choose Ebuild?
            </h2>

            {postAdError && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {postAdError}
              </div>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const title = formData.get('title') as string
                const description = formData.get('description') as string
                const price = parseFloat(formData.get('price') as string)
                const category = formData.get('category') as string
                const location = formData.get('location') as string
                const contactPhone = formData.get('contactPhone') as string
                const contactEmail = formData.get('contactEmail') as string
                
                handlePostAd({
                  title,
                  description,
                  price,
                  category,
                  location,
                  contactPhone,
                  contactEmail
                })
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Ad Title *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Premium Steel Beams - Grade A"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                  placeholder="Describe your product or service in detail..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Price (PKR) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="Materials">Materials</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Tools">Tools</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Location *
                </label>
                <input
                  name="location"
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Karachi, Sindh"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Contact Phone *
                  </label>
                  <input
                    name="contactPhone"
                    type="tel"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    placeholder="+92 300 1234567"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Contact Email *
                  </label>
                  <input
                    name="contactEmail"
                    type="email"
                    required
                    defaultValue={user?.email || ''}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={postAdLoading}
                style={{
                  backgroundColor: postAdLoading ? '#9ca3af' : '#10b981',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: postAdLoading ? 'not-allowed' : 'pointer',
                  marginTop: '8px'
                }}
              >
                {postAdLoading ? 'Posting Ad...' : 'Post Ad'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
