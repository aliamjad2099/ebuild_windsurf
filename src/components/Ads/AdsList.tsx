import { useEffect, useState } from 'react'
import { MapPin, Calendar, DollarSign } from 'lucide-react'
import type { Ad } from '../../lib/supabase'

export function AdsList() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const categories = [
    'Building Materials',
    'Tools & Equipment', 
    'Heavy Machinery',
    'Electrical Supplies',
    'Plumbing Supplies',
    'Safety Equipment',
    'Concrete & Cement',
    'Roofing Materials',
    'Flooring',
    'Paint & Coatings',
    'Hardware',
    'Services'
  ]

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    // Mock data for demonstration - will be replaced with real Supabase calls later
    const mockAds: Ad[] = [
      {
        id: '1',
        seller_id: 'seller1',
        title: 'Professional Concrete Mixer - Heavy Duty',
        description: 'High-quality concrete mixer perfect for construction sites. 350L capacity, electric motor, excellent condition. Used for only 6 months on residential projects.',
        price: 2500,
        category: 'Heavy Machinery',
        location: 'New York, NY',
        images: [],
        status: 'approved',
        is_featured: true,
        is_premium: false,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
        seller: { 
          id: 'seller1', 
          full_name: 'John Construction Co.', 
          email: 'john@construction.com',
          role: 'seller' as const,
          membership_type: 'premium' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: '2',
        seller_id: 'seller2',
        title: 'Premium Steel Rebar - Grade 60',
        description: 'High-grade steel rebar suitable for all construction projects. Various sizes available: #4, #5, #6. Meets all ASTM standards. Bulk pricing available.',
        price: 850,
        category: 'Building Materials',
        location: 'Los Angeles, CA',
        images: [],
        status: 'approved',
        is_featured: false,
        is_premium: true,
        created_at: '2024-01-09T14:30:00Z',
        updated_at: '2024-01-09T14:30:00Z',
        seller: { 
          id: 'seller2', 
          full_name: 'Steel Supply Pro', 
          email: 'sales@steelsupply.com',
          role: 'seller' as const,
          membership_type: 'premium' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: '3',
        seller_id: 'seller3',
        title: 'Complete Electrical Tool Set',
        description: 'Professional electrician tool kit including wire strippers, multimeter, voltage tester, drill bits, and carrying case. Perfect for residential and commercial work.',
        price: 450,
        category: 'Tools & Equipment',
        location: 'Chicago, IL',
        images: [],
        status: 'approved',
        is_featured: false,
        is_premium: false,
        created_at: '2024-01-08T09:15:00Z',
        updated_at: '2024-01-08T09:15:00Z',
        seller: { 
          id: 'seller3', 
          full_name: 'Mike\'s Tools', 
          email: 'mike@mikestools.com',
          role: 'seller' as const,
          membership_type: 'free' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: '4',
        seller_id: 'seller4',
        title: 'Industrial Safety Equipment Package',
        description: 'Complete safety package including hard hats, safety vests, steel-toe boots (various sizes), safety glasses, and first aid kit. OSHA compliant.',
        price: 320,
        category: 'Safety Equipment',
        location: 'Houston, TX',
        images: [],
        status: 'approved',
        is_featured: true,
        is_premium: true,
        created_at: '2024-01-07T16:45:00Z',
        updated_at: '2024-01-07T16:45:00Z',
        seller: { 
          id: 'seller4', 
          full_name: 'SafeWork Solutions', 
          email: 'info@safework.com',
          role: 'seller' as const,
          membership_type: 'premium' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: '5',
        seller_id: 'seller5',
        title: 'Plumbing Services - Licensed Professional',
        description: 'Licensed plumber available for residential and commercial projects. Specializing in pipe installation, leak repairs, and bathroom renovations. 15+ years experience.',
        price: 85,
        category: 'Services',
        location: 'Phoenix, AZ',
        images: [],
        status: 'approved',
        is_featured: false,
        is_premium: false,
        created_at: '2024-01-06T11:20:00Z',
        updated_at: '2024-01-06T11:20:00Z',
        seller: { 
          id: 'seller5', 
          full_name: 'Arizona Plumbing Pro', 
          email: 'service@azplumbing.com',
          role: 'seller' as const,
          membership_type: 'free' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: '6',
        seller_id: 'seller6',
        title: 'Premium Ceramic Floor Tiles',
        description: 'Beautiful ceramic tiles perfect for kitchens, bathrooms, and commercial spaces. Water-resistant, easy to clean. 500 sq ft available. Color: Marble White.',
        price: 1200,
        category: 'Flooring',
        location: 'Miami, FL',
        images: [],
        status: 'approved',
        is_featured: false,
        is_premium: false,
        created_at: '2024-01-05T13:10:00Z',
        updated_at: '2024-01-05T13:10:00Z',
        seller: { 
          id: 'seller6', 
          full_name: 'Florida Tile Co.', 
          email: 'sales@fltile.com',
          role: 'seller' as const,
          membership_type: 'free' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: '7',
        seller_id: 'seller7',
        title: 'Exterior Paint - Weather Resistant',
        description: 'High-quality exterior paint suitable for all weather conditions. 20 gallons available in various colors. 10-year warranty. Perfect for residential and commercial buildings.',
        price: 680,
        category: 'Paint & Coatings',
        location: 'Seattle, WA',
        images: [],
        status: 'approved',
        is_featured: true,
        is_premium: false,
        created_at: '2024-01-04T08:30:00Z',
        updated_at: '2024-01-04T08:30:00Z',
        seller: { 
          id: 'seller7', 
          full_name: 'Northwest Paint Supply', 
          email: 'orders@nwpaint.com',
          role: 'seller' as const,
          membership_type: 'premium' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: '8',
        seller_id: 'seller8',
        title: 'Roofing Materials - Asphalt Shingles',
        description: 'Premium asphalt shingles for residential roofing. 30-year architectural shingles, wind resistant up to 110 mph. Enough material for 2000 sq ft roof.',
        price: 1850,
        category: 'Roofing Materials',
        location: 'Denver, CO',
        images: [],
        status: 'approved',
        is_featured: false,
        is_premium: true,
        created_at: '2024-01-03T15:45:00Z',
        updated_at: '2024-01-03T15:45:00Z',
        seller: { 
          id: 'seller8', 
          full_name: 'Mountain Roofing Supply', 
          email: 'info@mountainroof.com',
          role: 'seller' as const,
          membership_type: 'premium' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      }
    ]

    // Simulate API call delay
    setTimeout(() => {
      setAds(mockAds)
      setLoading(false)
    }, 500)

    // Real Supabase call (commented out for now)
    /*
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          seller:users(full_name, email)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAds(data || [])
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
    */
  }

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || ad.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">Loading ads...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for products, services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {filteredAds.length} {filteredAds.length === 1 ? 'result' : 'results'} found
        </p>
      </div>

      {/* Ads Grid */}
      {filteredAds.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No ads found</div>
          <p className="text-gray-400">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search criteria'
              : 'Be the first to post an ad!'
            }
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="card hover:shadow-lg transition-shadow">
              {/* Placeholder for image */}
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="text-sm">No image</div>
                  <div className="text-xs">Coming soon</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {ad.title}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">
                    {ad.category}
                  </p>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3">
                  {ad.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{ad.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(ad.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-lg font-bold text-green-600">
                    <DollarSign className="h-5 w-5" />
                    <span>{ad.price.toLocaleString()}</span>
                  </div>
                  {ad.seller && (
                    <div className="text-sm text-gray-500">
                      by {ad.seller.full_name}
                    </div>
                  )}
                </div>

                <button className="w-full btn-primary">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
