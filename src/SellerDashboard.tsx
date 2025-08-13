import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Upload, 
  CreditCard, 
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react'

interface SellerDashboardProps {
  user: any
  onBackToHome: () => void
}

export function SellerDashboard({ user, onBackToHome }: SellerDashboardProps) {
  const [sellerView, setSellerView] = useState<'dashboard' | 'ads' | 'analytics' | 'membership'>('dashboard')
  const [sellerAds, setSellerAds] = useState<any[]>([])
  const [adsLoading, setAdsLoading] = useState(false)
  const [sellerStats, setSellerStats] = useState({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalContacts: 0
  })
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [uploadingProof, setUploadingProof] = useState(false)

  // Fetch seller's ads
  const fetchSellerAds = async () => {
    if (!user) return
    
    setAdsLoading(true)
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSellerAds(data || [])
    } catch (error: any) {
      console.error('Failed to fetch seller ads:', error)
    } finally {
      setAdsLoading(false)
    }
  }

  // Fetch seller statistics
  const fetchSellerStats = async () => {
    if (!user) return
    
    try {
      // Get ad counts
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('id, status')
        .eq('seller_id', user.id)

      if (adsError) throw adsError

      const totalAds = adsData?.length || 0
      const activeAds = adsData?.filter(ad => ad.status === 'active').length || 0

      // Get view counts (if ad_views table exists)
      let totalViews = 0
      try {
        const { data: viewsData, error: viewsError } = await supabase
          .from('ad_views')
          .select('id')
          .in('ad_id', adsData?.map(ad => ad.id) || [])

        if (!viewsError) {
          totalViews = viewsData?.length || 0
        }
      } catch (e) {
        console.log('Views data not available')
      }

      // Get contact counts (if ad_contacts table exists)
      let totalContacts = 0
      try {
        const { data: contactsData, error: contactsError } = await supabase
          .from('ad_contacts')
          .select('id')
          .in('ad_id', adsData?.map(ad => ad.id) || [])

        if (!contactsError) {
          totalContacts = contactsData?.length || 0
        }
      } catch (e) {
        console.log('Contacts data not available')
      }

      setSellerStats({
        totalAds,
        activeAds,
        totalViews,
        totalContacts
      })
    } catch (error: any) {
      console.error('Failed to fetch seller stats:', error)
    }
  }

  // Delete ad
  const deleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId)
        .eq('seller_id', user.id) // Ensure seller can only delete their own ads

      if (error) throw error
      
      fetchSellerAds()
      fetchSellerStats()
      alert('Ad deleted successfully!')
    } catch (error: any) {
      console.error('Failed to delete ad:', error)
      alert('Failed to delete ad. Please try again.')
    }
  }

  // Handle payment proof upload
  const handlePaymentProofUpload = async () => {
    if (!paymentProofFile || !user) return
    
    setUploadingProof(true)
    try {
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll simulate the upload and create a record
      
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create payment proof record (you'd need to create this table)
      const { error } = await supabase
        .from('payment_proofs')
        .insert({
          user_id: user.id,
          file_name: paymentProofFile.name,
          file_size: paymentProofFile.size,
          status: 'pending',
          uploaded_at: new Date().toISOString()
        })

      if (error) {
        console.log('Payment proofs table not available, simulating success')
      }
      
      alert('Payment proof uploaded successfully! Admin will review and activate your premium membership.')
      setPaymentProofFile(null)
    } catch (error: any) {
      console.error('Failed to upload payment proof:', error)
      alert('Failed to upload payment proof. Please try again.')
    } finally {
      setUploadingProof(false)
    }
  }

  // Load data when view changes
  useEffect(() => {
    if (sellerView === 'dashboard' || sellerView === 'analytics') {
      fetchSellerStats()
    }
    if (sellerView === 'ads') {
      fetchSellerAds()
    }
  }, [sellerView])

  // Initial load
  useEffect(() => {
    fetchSellerStats()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
              Seller Dashboard
            </h1>
            <button
              onClick={onBackToHome}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Back to Home
            </button>
          </div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Welcome back, {user?.full_name}! Manage your ads and grow your business.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '32px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '0'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'ads', label: 'My Ads', icon: Edit },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'membership', label: 'Membership', icon: Star }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSellerView(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  border: 'none',
                  borderBottom: sellerView === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: sellerView === tab.id ? '#3b82f6' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Dashboard Overview */}
        {sellerView === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ 
                    backgroundColor: '#dbeafe', 
                    padding: '8px', 
                    borderRadius: '6px' 
                  }}>
                    <Edit size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                    TOTAL ADS
                  </h3>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {sellerStats.totalAds}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ 
                    backgroundColor: '#dcfce7', 
                    padding: '8px', 
                    borderRadius: '6px' 
                  }}>
                    <TrendingUp size={20} style={{ color: '#16a34a' }} />
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                    ACTIVE ADS
                  </h3>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {sellerStats.activeAds}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ 
                    backgroundColor: '#fef3c7', 
                    padding: '8px', 
                    borderRadius: '6px' 
                  }}>
                    <Eye size={20} style={{ color: '#d97706' }} />
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                    TOTAL VIEWS
                  </h3>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {sellerStats.totalViews}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ 
                    backgroundColor: '#fce7f3', 
                    padding: '8px', 
                    borderRadius: '6px' 
                  }}>
                    <CreditCard size={20} style={{ color: '#be185d' }} />
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                    CONTACTS
                  </h3>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {sellerStats.totalContacts}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSellerView('ads')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <Plus size={16} />
                  Manage Ads
                </button>
                
                <button
                  onClick={() => setSellerView('analytics')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <BarChart3 size={16} />
                  View Analytics
                </button>
                
                <button
                  onClick={() => setSellerView('membership')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <Star size={16} />
                  Upgrade Membership
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Ads Management */}
        {sellerView === 'ads' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                My Advertisements
              </h2>
              <button
                onClick={() => {/* Navigate to post ad */}}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Plus size={16} />
                Post New Ad
              </button>
            </div>

            {adsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>Loading your ads...</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {sellerAds.map((ad) => (
                  <div key={ad.id} style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                          {ad.title}
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: '12px', fontSize: '14px' }}>
                          {ad.description}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={14} />
                            PKR {ad.price?.toLocaleString()}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} />
                            {ad.location}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} />
                            {new Date(ad.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: ad.status === 'active' ? '#dcfce7' : '#fee2e2',
                          color: ad.status === 'active' ? '#16a34a' : '#dc2626'
                        }}>
                          {ad.status?.toUpperCase()}
                        </span>
                        <button
                          onClick={() => {/* Edit functionality */}}
                          style={{
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            padding: '8px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteAd(ad.id)}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            padding: '8px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {sellerAds.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No ads posted yet</h3>
                    <p>Start by posting your first advertisement to reach potential customers.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics View */}
        {sellerView === 'analytics' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>
              Performance Analytics
            </h2>
            
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Detailed Analytics Coming Soon
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Track ad performance, view trends, and optimize your listings for better results.
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginTop: '24px'
              }}>
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>
                    Ad Views
                  </h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {sellerStats.totalViews}
                  </p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>
                    Contact Requests
                  </h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {sellerStats.totalContacts}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Membership Management */}
        {sellerView === 'membership' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>
              Membership & Billing
            </h2>
            
            {/* Current Membership Status */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Current Plan
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: user?.membership_type === 'premium' ? '#fef3c7' : '#f3f4f6',
                  color: user?.membership_type === 'premium' ? '#d97706' : '#374151'
                }}>
                  {user?.membership_type?.toUpperCase() || 'FREE'} MEMBER
                </span>
              </div>
              
              {user?.membership_type === 'free' && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #fbbf24'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                    Upgrade to Premium
                  </h4>
                  <p style={{ color: '#92400e', fontSize: '14px', marginBottom: '16px' }}>
                    Get unlimited ads, featured listings, and priority support.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                      style={{ fontSize: '14px' }}
                    />
                    <button
                      onClick={handlePaymentProofUpload}
                      disabled={!paymentProofFile || uploadingProof}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: paymentProofFile && !uploadingProof ? '#d97706' : '#9ca3af',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: paymentProofFile && !uploadingProof ? 'pointer' : 'not-allowed',
                        fontSize: '14px'
                      }}
                    >
                      <Upload size={16} />
                      {uploadingProof ? 'Uploading...' : 'Upload Payment Proof'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Membership Benefits */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Membership Benefits
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
                    Free Membership
                  </h4>
                  <ul style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                    <li>• Up to 5 active ads</li>
                    <li>• Basic listing features</li>
                    <li>• Standard support</li>
                    <li>• Regular search placement</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#d97706', marginBottom: '12px' }}>
                    Premium Membership
                  </h4>
                  <ul style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                    <li>• Unlimited active ads</li>
                    <li>• Featured listings</li>
                    <li>• Priority support</li>
                    <li>• Top search placement</li>
                    <li>• Advanced analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
