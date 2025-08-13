import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

interface AdminDashboardProps {
  user: any
  onBackToHome: () => void
}

export default function AdminDashboard({ user, onBackToHome }: AdminDashboardProps) {
  const [adminView, setAdminView] = useState<'dashboard' | 'users' | 'ads'>('dashboard')
  const [adminStats, setAdminStats] = useState<any>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'seller' | 'buyer' | 'admin'>('all')
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [allAds, setAllAds] = useState<any[]>([])
  const [adsLoading, setAdsLoading] = useState(false)
  const [adSearchTerm, setAdSearchTerm] = useState('')
  const [adCategoryFilter, setAdCategoryFilter] = useState<'all' | 'materials' | 'equipment' | 'services' | 'tools'>('all')
  const [adStatusFilter, setAdStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Fetch admin stats
  const fetchAdminStats = async () => {
    if (!user || user.role !== 'admin') return
    
    setAdminLoading(true)
    try {
      const { data, error } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single()

      if (error) throw error
      setAdminStats(data)
    } catch (error: any) {
      console.error('Failed to fetch admin stats:', error)
    } finally {
      setAdminLoading(false)
    }
  }

  // Fetch all users
  const fetchAllUsers = async () => {
    if (!user || user.role !== 'admin') return
    
    setUsersLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllUsers(data || [])
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  // Update user status
  const updateUserStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    if (!user || user.role !== 'admin') return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error
      
      fetchAllUsers()
      alert(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`)
    } catch (error: any) {
      console.error('Failed to update user status:', error)
      alert('Failed to update user status. Please try again.')
    }
  }

  // Fetch all ads for admin management
  const fetchAllAds = async () => {
    if (!user || user.role !== 'admin') return
    
    setAdsLoading(true)
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          users!ads_seller_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllAds(data || [])
    } catch (error: any) {
      console.error('Failed to fetch ads:', error)
    } finally {
      setAdsLoading(false)
    }
  }

  // Delete ad
  const deleteAd = async (adId: string) => {
    if (!user || user.role !== 'admin') return
    
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId)

      if (error) throw error
      
      fetchAllAds()
      alert('Ad deleted successfully!')
    } catch (error: any) {
      console.error('Failed to delete ad:', error)
      alert('Failed to delete ad. Please try again.')
    }
  }

  // Update ad status
  const updateAdStatus = async (adId: string, newStatus: 'active' | 'inactive') => {
    if (!user || user.role !== 'admin') return
    
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: newStatus })
        .eq('id', adId)

      if (error) throw error
      
      fetchAllAds()
      alert(`Ad ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
    } catch (error: any) {
      console.error('Failed to update ad status:', error)
      alert('Failed to update ad status. Please try again.')
    }
  }

  // Update user membership
  const updateUserMembership = async (userId: string, newMembership: 'free' | 'premium') => {
    if (!user || user.role !== 'admin') return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ membership_type: newMembership })
        .eq('id', userId)

      if (error) throw error
      
      fetchAllUsers()
      alert(`Membership updated to ${newMembership} successfully!`)
    } catch (error: any) {
      console.error('Failed to update membership:', error)
      alert('Failed to update membership. Please try again.')
    }
  }

  // Load data when view changes
  useEffect(() => {
    if (adminView === 'dashboard') {
      fetchAdminStats()
    } else if (adminView === 'users') {
      fetchAllUsers()
    } else if (adminView === 'ads') {
      fetchAllAds()
    }
  }, [adminView])

  // Filter users
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = userSearchTerm === '' || 
      u.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  // Filter ads
  const filteredAds = allAds.filter(ad => {
    const matchesSearch = adSearchTerm === '' || 
      ad.title?.toLowerCase().includes(adSearchTerm.toLowerCase()) ||
      ad.description?.toLowerCase().includes(adSearchTerm.toLowerCase()) ||
      ad.users?.full_name?.toLowerCase().includes(adSearchTerm.toLowerCase())
    const matchesCategory = adCategoryFilter === 'all' || ad.category === adCategoryFilter
    const matchesStatus = adStatusFilter === 'all' || ad.status === adStatusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827' }}>
      <div style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', color: '#f9fafb' }}>
              Admin Dashboard
            </h2>
            <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '24px' }}>
              Platform management and analytics
            </p>
            <button 
              onClick={onBackToHome}
              style={{ 
                backgroundColor: '#374151', 
                color: '#f9fafb', 
                padding: '8px 16px', 
                borderRadius: '6px', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              ← Back to Platform
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px',
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            padding: '8px',
            border: '1px solid #374151'
          }}>
            {(['dashboard', 'users', 'ads'] as const).map(view => (
              <button
                key={view}
                onClick={() => setAdminView(view)}
                style={{
                  backgroundColor: adminView === view ? '#374151' : 'transparent',
                  color: adminView === view ? '#f9fafb' : '#9ca3af',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: adminView === view ? '600' : '400',
                  textTransform: 'capitalize'
                }}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Dashboard View */}
          {adminView === 'dashboard' && (
            <div>
              {adminLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '18px', marginBottom: '8px' }}>Loading dashboard...</div>
                  <p>Fetching platform analytics</p>
                </div>
              ) : adminStats ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '24px',
                  marginBottom: '40px'
                }}>
                  {[
                    { label: 'TOTAL SELLERS', value: adminStats.total_sellers, color: '#10b981' },
                    { label: 'TOTAL BUYERS', value: adminStats.total_buyers, color: '#3b82f6' },
                    { label: 'TOTAL USERS', value: adminStats.total_users, color: '#f59e0b' },
                    { label: 'ACTIVE ADS', value: adminStats.total_ads, color: '#8b5cf6' },
                    { label: "TODAY'S SIGNUPS", value: adminStats.today_signups, color: '#ef4444' },
                    { label: "TODAY'S VIEWS", value: adminStats.today_views, color: '#06b6d4' }
                  ].map(stat => (
                    <div key={stat.label} style={{
                      backgroundColor: '#1f2937',
                      padding: '24px',
                      borderRadius: '8px',
                      border: '1px solid #374151'
                    }}>
                      <h3 style={{ color: stat.color, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        {stat.label}
                      </h3>
                      <div style={{ color: '#f9fafb', fontSize: '32px', fontWeight: 'bold' }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Unable to load dashboard stats</h3>
                  <p>Please check your admin permissions</p>
                </div>
              )}

              {/* Quick Actions */}
              <div style={{
                backgroundColor: '#1f2937',
                padding: '32px',
                borderRadius: '8px',
                border: '1px solid #374151'
              }}>
                <h3 style={{ color: '#f9fafb', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <button 
                    onClick={() => setAdminView('users')}
                    style={{
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      padding: '16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Manage Users</div>
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>View, suspend, or promote users</div>
                  </button>
                  
                  <button 
                    onClick={() => setAdminView('ads')}
                    style={{
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      padding: '16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Moderate Ads</div>
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>Review and manage advertisements</div>
                  </button>
                  
                  <button 
                    onClick={fetchAdminStats}
                    style={{
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      padding: '16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Refresh Stats</div>
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>Update dashboard analytics</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Management View */}
          {adminView === 'users' && (
            <div>
              {/* Users Header and Filters */}
              <div style={{
                backgroundColor: '#1f2937',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #374151',
                marginBottom: '24px'
              }}>
                <h3 style={{ color: '#f9fafb', fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                  User Management
                </h3>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    style={{
                      flex: '1',
                      minWidth: '200px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#f9fafb',
                      fontSize: '14px'
                    }}
                  />
                  
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#f9fafb',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="seller">Sellers</option>
                    <option value="buyer">Buyers</option>
                    <option value="admin">Admins</option>
                  </select>
                  
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as any)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#f9fafb',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  
                  <button
                    onClick={fetchAllUsers}
                    style={{
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Users List */}
              {usersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '18px', marginBottom: '8px' }}>Loading users...</div>
                  <p>Fetching user data</p>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  overflow: 'hidden'
                }}>
                  {/* Users Table Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 120px 150px 120px 150px',
                    gap: '16px',
                    padding: '16px 24px',
                    backgroundColor: '#111827',
                    borderBottom: '1px solid #374151',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#9ca3af'
                  }}>
                    <div>USER</div>
                    <div>ROLE</div>
                    <div>STATUS</div>
                    <div>JOINED</div>
                    <div>MEMBERSHIP</div>
                    <div>ACTIONS</div>
                  </div>
                  
                  {/* Users List */}
                  {filteredUsers.map((user, index) => (
                    <div key={user.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 120px 120px 150px 120px 150px',
                      gap: '16px',
                      padding: '16px 24px',
                      borderBottom: index < filteredUsers.length - 1 ? '1px solid #374151' : 'none',
                      fontSize: '14px',
                      color: '#f9fafb'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {user.full_name || 'No Name'}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                          {user.email}
                        </div>
                      </div>
                      
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: user.role === 'admin' ? '#dc2626' : user.role === 'seller' ? '#059669' : '#3b82f6',
                          color: 'white'
                        }}>
                          {user.role?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: user.status === 'active' ? '#059669' : '#dc2626',
                          color: 'white'
                        }}>
                          {user.status?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div style={{ color: '#9ca3af' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: user.membership_type === 'premium' ? '#f59e0b' : '#6b7280',
                          color: 'white'
                        }}>
                          {user.membership_type?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => updateUserStatus(user.id, 'suspended')}
                            style={{
                              backgroundColor: '#dc2626',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(user.id, 'active')}
                            style={{
                              backgroundColor: '#059669',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Activate
                          </button>
                        )}
                        
                        {/* Membership Management - Only for sellers */}
                        {user.role === 'seller' && (
                          <>
                            {user.membership_type === 'free' ? (
                              <button
                                onClick={() => updateUserMembership(user.id, 'premium')}
                                style={{
                                  backgroundColor: '#f59e0b',
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ⭐ Upgrade
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserMembership(user.id, 'free')}
                                style={{
                                  backgroundColor: '#6b7280',
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ⬇️ Downgrade
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No users found</h3>
                      <p>No users match your current filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ads Management View */}
          {adminView === 'ads' && (
            <div>
              {/* Ads Header and Filters */}
              <div style={{
                backgroundColor: '#1f2937',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #374151',
                marginBottom: '24px'
              }}>
                <h3 style={{ color: '#f9fafb', fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                  Ad Management
                </h3>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search ads by title, description, or seller..."
                    value={adSearchTerm}
                    onChange={(e) => setAdSearchTerm(e.target.value)}
                    style={{
                      flex: '1',
                      minWidth: '200px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#f9fafb',
                      fontSize: '14px'
                    }}
                  />
                  
                  <select
                    value={adCategoryFilter}
                    onChange={(e) => setAdCategoryFilter(e.target.value as any)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#f9fafb',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">All Categories</option>
                    <option value="materials">Materials</option>
                    <option value="equipment">Equipment</option>
                    <option value="services">Services</option>
                    <option value="tools">Tools</option>
                  </select>
                  
                  <select
                    value={adStatusFilter}
                    onChange={(e) => setAdStatusFilter(e.target.value as any)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                      color: '#f9fafb',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <button
                    onClick={fetchAllAds}
                    style={{
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Ads List */}
              {adsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '18px', marginBottom: '8px' }}>Loading ads...</div>
                  <p>Fetching advertisement data</p>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  overflow: 'hidden'
                }}>
                  {/* Ads Table Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 120px 120px 150px 120px 180px',
                    gap: '16px',
                    padding: '16px 24px',
                    backgroundColor: '#111827',
                    borderBottom: '1px solid #374151',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#9ca3af'
                  }}>
                    <div>AD DETAILS</div>
                    <div>SELLER</div>
                    <div>CATEGORY</div>
                    <div>PRICE</div>
                    <div>POSTED</div>
                    <div>STATUS</div>
                    <div>ACTIONS</div>
                  </div>
                  
                  {/* Ads List */}
                  {filteredAds.map((ad, index) => (
                    <div key={ad.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 120px 120px 150px 120px 180px',
                      gap: '16px',
                      padding: '16px 24px',
                      borderBottom: index < filteredAds.length - 1 ? '1px solid #374151' : 'none',
                      fontSize: '14px',
                      color: '#f9fafb'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {ad.title || 'No Title'}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                          {ad.description ? 
                            (ad.description.length > 80 ? 
                              ad.description.substring(0, 80) + '...' : 
                              ad.description
                            ) : 'No description'
                          }
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>
                          📍 {ad.location || 'No location'}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {ad.users?.full_name || 'Unknown'}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                          {ad.users?.email || 'No email'}
                        </div>
                      </div>
                      
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: '#374151',
                          color: '#f9fafb'
                        }}>
                          {ad.category?.toUpperCase() || 'OTHER'}
                        </span>
                      </div>
                      
                      <div style={{ fontWeight: '600', color: '#10b981' }}>
                        PKR {ad.price?.toLocaleString() || '0'}
                      </div>
                      
                      <div style={{ color: '#9ca3af' }}>
                        {new Date(ad.created_at).toLocaleDateString()}
                      </div>
                      
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: ad.status === 'active' ? '#059669' : '#dc2626',
                          color: 'white'
                        }}>
                          {ad.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {ad.status === 'active' ? (
                          <button
                            onClick={() => updateAdStatus(ad.id, 'inactive')}
                            style={{
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => updateAdStatus(ad.id, 'active')}
                            style={{
                              backgroundColor: '#059669',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Activate
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteAd(ad.id)}
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredAds.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No ads found</h3>
                      <p>No advertisements match your current filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
