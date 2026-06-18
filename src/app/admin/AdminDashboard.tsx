'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, Appointment, AppointmentStatus, AppointmentType, Bill, BillItem, CalcType } from '@/lib/supabase';
import { WebsiteAsset } from '@/lib/images';
import { Product } from '@/lib/products';
import { Partner } from '@/lib/partners';
import { ContactMessage } from '@/lib/messages';
import styles from './admin.module.css';
import AdvancedDashboardView from './AdvancedDashboardView';
import ClientsView from './views/ClientsView';
import InspectionsView from './views/InspectionsView';
import InstallationsView from './views/InstallationsView';
import MaintenanceView from './views/MaintenanceView';
import ExpensesView from './views/ExpensesView';
import EmployeesView from './views/EmployeesView';
import ReportsView from './views/ReportsView';


const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: styles.statusPending,
  confirmed: styles.statusConfirmed,
  completed: styles.statusCompleted,
  cancelled: styles.statusCancelled,
};
const TYPE_LABELS: Record<AppointmentType, string> = {
  inspection: 'معاينة',
  installation: 'تركيب',
};
const TYPE_COLORS: Record<AppointmentType, string> = {
  inspection: styles.typeInspection,
  installation: styles.typeInstallation,
};
const CURTAIN_LABELS: Record<string, string> = {
  'Roller Blinds': 'ستائر رول',
  'Zebra Blinds': 'ستائر زيبرا',
  'Vertical Blinds': 'ستائر شرائح رأسية',
  'Metallic/Wooden Blinds': 'ستائر شرائح معدنية/خشبية',
  'Double System': 'ستائر دبل سيستم',
  'Printed': 'ستائر مطبوعة',
};

type FilterStatus = 'all' | AppointmentStatus;
type FilterType   = 'all' | AppointmentType;

const ROLE_TABS: Record<string, string[]> = {
  admin: ['dashboard', 'clients', 'appointments', 'inspections', 'installations', 'maintenance', 'bills', 'products', 'expenses', 'employees', 'reports', 'messages', 'website_edit', 'users'],
  customer_service: ['dashboard', 'clients', 'appointments', 'inspections', 'messages'],
  sales: ['dashboard', 'clients', 'products', 'bills', 'installations', 'maintenance'],
  accountant: ['dashboard', 'bills', 'expenses', 'reports'],
  technician: ['inspections', 'installations', 'maintenance'],
  employee: ['dashboard', 'appointments', 'messages'],
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType]     = useState<FilterType>('all');
  const [filterDate, setFilterDate]     = useState('');
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState<Appointment | null>(null);
  const [showModal, setShowModal]       = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving]             = useState(false);

  // New states for active tab
  const [activeTab, setActiveTab]       = useState<'appointments' | 'website_edit' | 'products' | 'orders' | 'bills' | 'messages' | 'users' | 'dashboard' | 'clients' | 'inspections' | 'installations' | 'maintenance' | 'expenses' | 'employees' | 'reports'>('dashboard');
  const [websiteAssets, setWebsiteAssets] = useState<WebsiteAsset[]>([]);

  // Role & checking states
  const [userRole, setUserRole] = useState<'admin' | 'customer_service' | 'sales' | 'accountant' | 'technician' | 'employee' | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);
  const [roleChecking, setRoleChecking] = useState(true);

  // Users Management state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);

  // Website Edit sub tab
  const [websiteEditSubTab, setWebsiteEditSubTab] = useState<'images' | 'partners'>('images');

  // Partners state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partial<Partner> | null>(null);
  const [uploadingPartnerLogo, setUploadingPartnerLogo] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);



  // Bills state
  const [bills, setBills] = useState<Bill[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Partial<Bill> | null>(null);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<Bill | null>(null);
  const [billsSearch, setBillsSearch] = useState('');
  const [billCreationMode, setBillCreationMode] = useState<'manual' | 'order'>('manual');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  
  // Bulk update state
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkPrice, setBulkPrice] = useState<number | "">("");

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Settings state
  const [newEmail, setNewEmail]         = useState('');
  const [newPassword, setNewPassword]   = useState('');

  const hasAccess = (tab: string) => {
    return ROLE_TABS[userRole || 'employee']?.includes(tab) || false;
  };
  const [settingsMsg, setSettingsMsg]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // New appointment form
  const [newAppt, setNewAppt] = useState({
    client_name: '', client_phone: '', client_address: '',
    appointment_type: 'inspection' as AppointmentType,
    appointment_date: '', appointment_time: '', curtain_type: '', notes: '',
  });

  // Verify user role on mount
  useEffect(() => {
    const checkUserRole = async () => {
      setRoleChecking(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.replace('/admin/login');
        return;
      }
      
      const user = session.user;
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('role, name, email')
        .eq('id', user.id)
        .single();
        
      if (error || !profile) {
        // Resilient default profile creation for initial admin
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (count === 0) {
          const newProfile = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || 'Admin',
            role: 'admin'
          };
          const { error: insertErr } = await supabase.from('profiles').insert([newProfile]);
          if (!insertErr) {
            setUserRole('admin');
            setUserProfile({ name: newProfile.name, email: newProfile.email });
            setRoleChecking(false);
            return;
          }
        }
        
        const metaRole = user.user_metadata?.role;
        const metaName = user.user_metadata?.name || 'User';
        const allowedRoles = ['admin', 'employee', 'customer_service', 'sales', 'accountant', 'technician'];
        if (metaRole && allowedRoles.includes(metaRole)) {
          const newProfile = {
            id: user.id,
            email: user.email || '',
            name: metaName,
            role: metaRole
          };
          await supabase.from('profiles').insert([newProfile]);
          setUserRole(metaRole as any);
          setUserProfile({ name: newProfile.name, email: newProfile.email });
          setDefaultTab(metaRole);
        } else {
          setUserRole('employee');
          setUserProfile({ name: metaName, email: user.email || '' });
          setDefaultTab('employee');
        }
      } else {
        setUserRole(profile.role as any);
        setUserProfile({ name: profile.name || '', email: profile.email || '' });
        setDefaultTab(profile.role);
      }
      setRoleChecking(false);
    };

    const setDefaultTab = (role: string) => {
      if (role === 'technician') {
        setActiveTab('inspections');
      } else if (role === 'accountant') {
        setActiveTab('bills');
      } else {
        setActiveTab('dashboard');
      }
    };

    checkUserRole();
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase
      .from('appointments').select('*').order('appointment_date', { ascending: true });
    if (error) setError('فشل تحميل البيانات. تحقق من إعدادات Supabase.');
    else setAppointments(data as Appointment[]);
    setLoading(false);
  }, []);

  const fetchWebsiteAssets = useCallback(async () => {
    setLoadingAssets(true);
    const { data, error } = await supabase.from('website_assets').select('*').order('key');
    if (!error && data) setWebsiteAssets(data as WebsiteAsset[]);
    setLoadingAssets(false);
  }, []);

  const fetchPartners = useCallback(async () => {
    setLoadingPartners(true);
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (!error && data) {
      setPartners(data.map((row: any) => ({
        id: row.id,
        nameAr: row.name_ar,
        nameEn: row.name_en,
        src: row.src,
        sort_order: row.sort_order || 0
      })));
    }
    setLoadingPartners(false);
  }, []);


  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setProducts(data.map((row: any) => ({
        id: row.id, images: row.images || [], alt: row.alt, labelEn: row.label_en, labelAr: row.label_ar,
        descEn: row.desc_en, descAr: row.desc_ar, detailsEn: row.details_en, detailsAr: row.details_ar,
        category: row.category, price: row.price, is_active: row.is_active ?? true, colors: row.colors || []
      })));
    }
    setLoadingProducts(false);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase.from('orders').select('*, products(label_ar, label_en)').order('created_at', { ascending: false });
    if (!error && data) {
      setOrders(data);
    }
    setLoadingOrders(false);
  }, []);

  const fetchBills = useCallback(async () => {
    setLoadingBills(true);
    const { data, error } = await supabase.from('bills').select('*').order('created_at', { ascending: false });
    if (!error && data) setBills(data as Bill[]);
    setLoadingBills(false);
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setMessages(data as ContactMessage[]);
    }
    setLoadingMessages(false);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    if (!error && count !== null) {
      setUnreadCount(count);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setUsers(data);
    }
    setLoadingUsers(false);
  }, []);


  const openNewBillModal = () => {
    setBillCreationMode('manual');
    const nextNum = bills.length + 1;
    const invNum = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;
    setSelectedBill({
      invoice_number: invNum,
      client_name: '',
      client_phone: '',
      client_address: '',
      order_number: '',
      payment_method: 'نقدي',
      delivery_date: '',
      items: [],
      discount: 0,
      installation_cost: 0,
      transport_cost: 0,
      deposit: 0,
      remaining_amount: 0,
      final_total: 0,
      notes: ''
    });
    setShowBillModal(true);
  };

  const handleSaveBill = async () => {
    if (!selectedBill || !selectedBill.client_name) {
      alert('يرجى إدخال اسم العميل'); return;
    }
    if (!selectedBill.items || selectedBill.items.length === 0) {
      alert('يرجى إضافة بند واحد على الأقل في الفاتورة'); return;
    }
    setSaving(true);
    
    const items = selectedBill.items || [];
    const totalItemsPrice = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const discount = Number(selectedBill.discount) || 0;
    const installation = Number(selectedBill.installation_cost) || 0;
    const transport = Number(selectedBill.transport_cost) || 0;
    const deposit = Number(selectedBill.deposit) || 0;

    const finalTotal = Math.round((totalItemsPrice - discount + installation + transport) * 100) / 100;
    const remainingAmount = Math.round((finalTotal - deposit) * 100) / 100;

    const payload = {
      invoice_number: selectedBill.invoice_number,
      client_name: selectedBill.client_name,
      client_phone: selectedBill.client_phone || null,
      client_address: selectedBill.client_address || null,
      order_number: selectedBill.order_number || null,
      payment_method: selectedBill.payment_method || 'نقدي',
      delivery_date: selectedBill.delivery_date || null,
      items: items,
      total_items_price: totalItemsPrice,
      discount: discount,
      installation_cost: installation,
      transport_cost: transport,
      deposit: deposit,
      remaining_amount: remainingAmount,
      final_total: finalTotal,
      notes: selectedBill.notes || null,
      updated_at: new Date().toISOString()
    };

    let error;
    if (selectedBill.id) {
      const res = await supabase.from('bills').update(payload).eq('id', selectedBill.id);
      error = res.error;
    } else {
      const res = await supabase.from('bills').insert([payload]);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      alert('خطأ أثناء حفظ الفاتورة: ' + error.message);
    } else {
      alert('تم حفظ الفاتورة بنجاح');
      setShowBillModal(false);
      fetchBills();
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الفاتورة؟')) return;
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) {
      alert('حدث خطأ أثناء الحذف: ' + error.message);
    } else {
      fetchBills();
    }
  };

  const handlePrint = (bill: Bill) => {
    setSelectedBillForPrint(bill);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const updateBillField = (field: string, value: any) => {
    if (!selectedBill) return;
    const updatedBill = { ...selectedBill, [field]: value };
    
    const items = updatedBill.items || [];
    const totalItemsPrice = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const discount = Number(updatedBill.discount) || 0;
    const installation = Number(updatedBill.installation_cost) || 0;
    const transport = Number(updatedBill.transport_cost) || 0;
    const deposit = Number(updatedBill.deposit) || 0;

    const finalTotal = Math.round((totalItemsPrice - discount + installation + transport) * 100) / 100;
    const remainingAmount = Math.round((finalTotal - deposit) * 100) / 100;

    setSelectedBill({
      ...updatedBill,
      total_items_price: totalItemsPrice,
      deposit: deposit,
      remaining_amount: remainingAmount,
      final_total: finalTotal
    });
  };

  const handleImportOrder = (orderId: string) => {
    if (!orderId) {
      setSelectedBill(prev => prev ? {
        ...prev,
        client_name: '',
        client_phone: '',
        client_address: '',
        order_number: '',
        items: [],
        total_items_price: 0,
        deposit: 0,
        remaining_amount: 0,
        final_total: 0
      } : null);
      return;
    }
    const order = orders.find(o => String(o.id) === orderId);
    if (!order) return;

    const importedItem: BillItem = {
      name: `${order.products?.label_ar || 'ستارة'} (${order.width} × ${order.height} سم)`,
      calcType: 'unit',
      width: Number(order.width) / 100,
      height: Number(order.height) / 100,
      quantity: Number(order.pieces) || 1,
      price: Number(order.total_price) / (Number(order.pieces) || 1),
      total: Number(order.total_price)
    };

    setSelectedBill(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        client_name: order.client_name || '',
        client_phone: order.client_phone || '',
        client_address: order.client_address || '',
        order_number: String(order.id).slice(0, 8).toUpperCase(),
        items: [importedItem]
      };
      
      const totalItemsPrice = Number(order.total_price);
      const discount = Number(updated.discount) || 0;
      const installation = Number(updated.installation_cost) || 0;
      const transport = Number(updated.transport_cost) || 0;
      const deposit = Number(updated.deposit) || 0;

      const finalTotal = Math.round((totalItemsPrice - discount + installation + transport) * 100) / 100;
      const remainingAmount = Math.round((finalTotal - deposit) * 100) / 100;

      return {
        ...updated,
        total_items_price: totalItemsPrice,
        deposit: deposit,
        remaining_amount: remainingAmount,
        final_total: finalTotal
      };
    });
  };

  const handleProductSelect = (index: number, labelAr: string) => {
    if (!selectedBill || !selectedBill.items) return;
    const prod = products.find(p => p.labelAr === labelAr);
    
    const newItems = [...selectedBill.items];
    const item = { ...newItems[index] };
    
    if (prod) {
      item.name = prod.labelAr;
      item.price = prod.price;
    } else {
      item.name = '';
      item.price = 0;
    }

    const qty = Number(item.quantity) || 0;
    const w = Number(item.width) || 0;
    const h = Number(item.height) || 0;
    const p = Number(item.price) || 0;
    const mode = item.calcType;

    if (mode === 'square_meter') {
      item.total = Math.round((qty * w * h * p) * 100) / 100;
    } else if (mode === 'linear_width') {
      item.total = Math.round((qty * w * p) * 100) / 100;
    } else if (mode === 'linear_height') {
      item.total = Math.round((qty * h * p) * 100) / 100;
    } else {
      item.total = Math.round((qty * p) * 100) / 100;
    }

    newItems[index] = item;

    const totalItemsPrice = newItems.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
    const discount = Number(selectedBill.discount) || 0;
    const installation = Number(selectedBill.installation_cost) || 0;
    const transport = Number(selectedBill.transport_cost) || 0;
    const deposit = Number(selectedBill.deposit) || 0;

    const finalTotal = Math.round((totalItemsPrice - discount + installation + transport) * 100) / 100;
    const remainingAmount = Math.round((finalTotal - deposit) * 100) / 100;

    setSelectedBill({
      ...selectedBill,
      items: newItems,
      total_items_price: totalItemsPrice,
      deposit: deposit,
      remaining_amount: remainingAmount,
      final_total: finalTotal
    });
  };

  const updateBillItemField = (index: number, field: string, value: any) => {
    if (!selectedBill || !selectedBill.items) return;
    const newItems = [...selectedBill.items];
    const item = { ...newItems[index], [field]: value };

    if (['width', 'height', 'quantity', 'price', 'calcType'].includes(field)) {
      const qty = Number(item.quantity) || 0;
      const w = Number(item.width) || 0;
      const h = Number(item.height) || 0;
      const p = Number(item.price) || 0;
      const mode = item.calcType;

      if (mode === 'square_meter') {
        item.total = Math.round((qty * w * h * p) * 100) / 100;
      } else if (mode === 'linear_width') {
        item.total = Math.round((qty * w * p) * 100) / 100;
      } else if (mode === 'linear_height') {
        item.total = Math.round((qty * h * p) * 100) / 100;
      } else {
        item.total = Math.round((qty * p) * 100) / 100;
      }
    } else if (field === 'total') {
      item.total = Number(value) || 0;
    }

    newItems[index] = item;

    const totalItemsPrice = newItems.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
    const discount = Number(selectedBill.discount) || 0;
    const installation = Number(selectedBill.installation_cost) || 0;
    const transport = Number(selectedBill.transport_cost) || 0;
    const deposit = Number(selectedBill.deposit) || 0;

    const finalTotal = Math.round((totalItemsPrice - discount + installation + transport) * 100) / 100;
    const remainingAmount = Math.round((finalTotal - deposit) * 100) / 100;

    setSelectedBill({
      ...selectedBill,
      items: newItems,
      total_items_price: totalItemsPrice,
      deposit: deposit,
      remaining_amount: remainingAmount,
      final_total: finalTotal
    });
  };

  const removeBillItem = (index: number) => {
    if (!selectedBill || !selectedBill.items) return;
    const newItems = selectedBill.items.filter((_, i) => i !== index);

    const totalItemsPrice = newItems.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
    const discount = Number(selectedBill.discount) || 0;
    const installation = Number(selectedBill.installation_cost) || 0;
    const transport = Number(selectedBill.transport_cost) || 0;
    const deposit = Number(selectedBill.deposit) || 0;

    const finalTotal = Math.round((totalItemsPrice - discount + installation + transport) * 100) / 100;
    const remainingAmount = Math.round((finalTotal - deposit) * 100) / 100;

    setSelectedBill({
      ...selectedBill,
      items: newItems,
      total_items_price: totalItemsPrice,
      deposit: deposit,
      remaining_amount: remainingAmount,
      final_total: finalTotal
    });
  };

  const addItemToBill = () => {
    if (!selectedBill) return;
    const newItem: BillItem = {
      name: '',
      height: 1.00,
      width: 1.00,
      quantity: 1,
      price: 0,
      calcType: 'square_meter',
      total: 0
    };
    setSelectedBill({
      ...selectedBill,
      items: [...(selectedBill.items || []), newItem]
    });
  };

  // Redirect employees if they somehow land on admin-only tabs
  useEffect(() => {
    if (userRole === 'employee' && ['bills', 'products', 'website_edit', 'users'].includes(activeTab)) {
      setActiveTab('appointments');
    }
  }, [activeTab, userRole]);

  useEffect(() => { 
    fetchUnreadCount();
    if (activeTab === 'appointments') fetchAppointments(); 
    if (activeTab === 'website_edit') {
      fetchWebsiteAssets();
      fetchPartners();
    }
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'bills') {
      fetchBills();
      fetchProducts();
      fetchOrders();
    }
    if (activeTab === 'messages') {
      fetchMessages();
    }
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [fetchAppointments, fetchWebsiteAssets, fetchPartners, fetchProducts, fetchOrders, fetchBills, fetchMessages, fetchUnreadCount, fetchUsers, activeTab]);



  const filtered = appointments.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterType   !== 'all' && a.appointment_type !== filterType) return false;
    if (filterDate   && a.appointment_date !== filterDate) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.client_name.toLowerCase().includes(q) || a.client_phone.includes(q) || a.client_address.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    inspection: appointments.filter(a => a.appointment_type === 'inspection').length,
    installation: appointments.filter(a => a.appointment_type === 'installation').length,
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setSaving(true);
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    }
    setSaving(false);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    setSaving(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder((prev: any) => prev ? { ...prev, status } : null);
    }
    setSaving(false);
  };

  const updateOrderPaymentStatus = async (id: string, paymentStatus: string) => {
    setSaving(true);
    const { error } = await supabase.from('orders').update({ payment_status: paymentStatus }).eq('id', id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: paymentStatus } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev: any) => prev ? { ...prev, payment_status: paymentStatus } : null);
      }
    } else {
      alert('حدث خطأ أثناء تحديث حالة الدفع: ' + error.message);
    }
    setSaving(false);
  };

  const getWhatsAppMessageLink = (order: any, isSuccess: boolean) => {
    if (!order || !order.whatsapp_number) return '#';
    let cleanPhone = order.whatsapp_number.replace(/\D/g, '');
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '20' + cleanPhone;
    } else if (cleanPhone.startsWith('1') && cleanPhone.length === 10) {
      cleanPhone = '20' + cleanPhone;
    }
    const orderNum = order.id.split('-')[0].toUpperCase();
    const clientName = order.client_name;
    const message = isSuccess
      ? `مرحباً ${clientName}، تم تأكيد استلام دفعتك للطلب رقم (${orderNum}) بنجاح. سنقوم بتجهيز طلبك وشحنه قريباً. شكراً لتعاملك مع كريستال بليندز!`
      : `مرحباً ${clientName}، نأسف لإبلاغك بأنه لم نتمكن من تأكيد دفعتك للطلب رقم (${orderNum}). يرجى التحقق من عملية التحويل وإرسال صورة المعاملة الصحيحة. شكراً لك.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الموعد؟')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) { setAppointments(prev => prev.filter(a => a.id !== id)); setShowModal(false); setSelected(null); }
  };

  const addAppointment = async () => {
    if (!newAppt.client_name || !newAppt.client_phone || !newAppt.appointment_date || !newAppt.appointment_time) {
      alert('يرجى ملء جميع الحقول المطلوبة'); return;
    }
    setSaving(true);
    const { data, error } = await supabase.from('appointments').insert([{ ...newAppt, status: 'pending' }]).select().single();
    if (!error && data) {
      setAppointments(prev => [...prev, data as Appointment]);
      setShowAddModal(false);
      setNewAppt({ client_name: '', client_phone: '', client_address: '', appointment_type: 'inspection', appointment_date: '', appointment_time: '', curtain_type: '', notes: '' });
    }
    setSaving(false);
  };

  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      alert('يرجى ملء جميع الحقول المطلوبة'); return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إنشاء المستخدم');
      }
      
      alert('تم إنشاء المستخدم بنجاح');
      setShowUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'employee' });
      fetchUsers();
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم إلغاء وصوله للوحة التحكم فوراً.')) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حذف المستخدم');
      }
      
      alert('تم حذف المستخدم بنجاح');
      fetchUsers();
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const handleUpdateCredentials = async () => {
    setSettingsSaving(true); setSettingsMsg(null);
    const updates: { email?: string; password?: string } = {};
    if (newEmail.trim())    updates.email    = newEmail.trim();
    if (newPassword.trim()) updates.password = newPassword.trim();
    if (!updates.email && !updates.password) {
      setSettingsMsg({ type: 'error', text: 'أدخل بريد إلكتروني أو كلمة مرور جديدة' });
      setSettingsSaving(false); return;
    }
    const { error } = await supabase.auth.updateUser(updates);
    if (error) setSettingsMsg({ type: 'error', text: error.message });
    else { setSettingsMsg({ type: 'success', text: 'تم التحديث بنجاح' }); setNewEmail(''); setNewPassword(''); }
    setSettingsSaving(false);
  };

  const handleUploadImage = async (key: string, file: File) => {
    setUploadingAsset(key);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${key}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('website_images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('website_images').getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;
      const { error: upsertError } = await supabase.from('website_assets').upsert({ key, url: publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (upsertError) throw upsertError;
      fetchWebsiteAssets();
      alert('تم رفع الصورة بنجاح');
    } catch (err) {
      alert('فشل رفع الصورة: ' + (err as any).message);
    } finally {
      setUploadingAsset(null);
    }
  };

  const handleUploadPartnerLogo = async (file: File) => {
    setUploadingPartnerLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `partner-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('partner_images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('partner_images').getPublicUrl(fileName);
      setSelectedPartner(prev => prev ? { ...prev, src: publicUrlData.publicUrl } : null);
    } catch (err) {
      alert('فشل رفع الصورة: ' + (err as any).message);
    } finally {
      setUploadingPartnerLogo(false);
    }
  };

  const handleSavePartner = async () => {
    if (!selectedPartner?.nameAr || !selectedPartner?.nameEn) {
      alert('يرجى إدخال اسم الشريك باللغتين العربية والإنجليزية'); return;
    }
    if (!selectedPartner?.src) {
      alert('يرجى رفع شعار الشريك'); return;
    }
    setSaving(true);
    const payload = {
      name_ar: selectedPartner.nameAr,
      name_en: selectedPartner.nameEn,
      src: selectedPartner.src,
      sort_order: selectedPartner.sort_order ?? 0,
      updated_at: new Date().toISOString()
    };
    
    let error;
    if (selectedPartner.id) {
      const res = await supabase.from('partners').update(payload).eq('id', selectedPartner.id);
      error = res.error;
    } else {
      const res = await supabase.from('partners').insert([payload]);
      error = res.error;
    }
    if (error) {
      alert('خطأ أثناء حفظ بيانات الشريك: ' + error.message);
    } else {
      setShowPartnerModal(false);
      fetchPartners();
    }
    setSaving(false);
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الشريك؟')) return;
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) {
      alert('حدث خطأ أثناء الحذف: ' + error.message);
    } else {
      fetchPartners();
    }
  };

  const markMessageAsRead = async (id: string, isRead: boolean) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: isRead })
      .eq('id', id);
    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: isRead } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, is_read: isRead } : null);
      }
      fetchUnreadCount();
    } else {
      alert('خطأ أثناء تحديث حالة الرسالة: ' + error.message);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الرسالة نهائياً؟')) return;
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== id));
      setShowMessageModal(false);
      setSelectedMessage(null);
      fetchUnreadCount();
    } else {
      alert('حدث خطأ أثناء حذف الرسالة: ' + error.message);
    }
  };



  const handleSaveProduct = async () => {
    if (!selectedProduct?.labelEn || !selectedProduct?.labelAr) {
      alert('يرجى إدخال اسم المنتج'); return;
    }
    setSaving(true);
    const payload = {
      alt: selectedProduct.alt || selectedProduct.labelEn,
      label_en: selectedProduct.labelEn, label_ar: selectedProduct.labelAr,
      desc_en: selectedProduct.descEn || '', desc_ar: selectedProduct.descAr || '',
      details_en: selectedProduct.detailsEn || '', details_ar: selectedProduct.detailsAr || '',
      category: selectedProduct.category || 'Modern', price: selectedProduct.price || 0,
      images: selectedProduct.images || [], updated_at: new Date().toISOString(),
      is_active: selectedProduct.is_active !== false,
      colors: selectedProduct.colors || []
    };
    
    if (selectedProduct.id) {
      await supabase.from('products').update(payload).eq('id', selectedProduct.id);
    } else {
      await supabase.from('products').insert([payload]);
    }
    setSaving(false);
    setShowProductModal(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const handleUploadProductImage = async (file: File) => {
    setUploadingProductImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product_images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(fileName);
      setSelectedProduct(prev => prev ? { ...prev, images: [...(prev.images || []), publicUrlData.publicUrl] } : null);
    } catch (err) {
      alert('فشل رفع الصورة: ' + (err as any).message);
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleBulkUpdatePrice = async () => {
    if (!bulkCategory || bulkPrice === "") return;
    if (!confirm(`هل أنت متأكد من تغيير سعر المتر لجميع منتجات قسم ${bulkCategory} إلى ${bulkPrice} ج.م؟`)) return;
    
    setSaving(true);
    const { error } = await supabase.from('products').update({ price: Number(bulkPrice) }).eq('category', bulkCategory);
    setSaving(false);
    
    if (error) {
      alert('حدث خطأ أثناء التحديث');
    } else {
      alert('تم التحديث بنجاح');
      setBulkCategory("");
      setBulkPrice("");
      fetchProducts();
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (t: string) => t?.slice(0, 5) ?? '';
  const today      = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.appointment_date === today).length;

  if (roleChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfbf7', fontFamily: 'Tajawal, sans-serif', color: '#3E2723', flexDirection: 'column', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(62,39,35,0.1)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>جاري التحقق من الصلاحيات...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.shell} !bg-[#FBF9F6] ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div className={styles.mobileBackdrop} onClick={() => setMobileMenuOpen(false)} />
        )}
      {/* Sidebar */}
      <aside className={`${styles.sidebar} !bg-[#2B1B17] !border-l border-white/5 !text-white/70 shadow-xl`}>
        <button className={styles.mobileClose} onClick={() => setMobileMenuOpen(false)}>✕</button>
        <div className="flex flex-col items-center gap-2 pb-5 border-b border-white/5 w-full">
          <img src="/logo2.png" alt="Crystal Blinds" className="h-[105px] object-contain filter brightness-0 invert" />
          <span className="text-[10px] text-[#d4af37] font-extrabold tracking-widest uppercase">CRYSTAL BLINDS</span>
        </div>
        <nav className="flex flex-col gap-1.5 flex-1 w-full overflow-y-auto hide-scrollbar">
          {/* Dashboard (Main) Link */}
          {hasAccess('dashboard') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span>لوحة التحكم</span>
            </div>
          )}

          {/* Clients Link */}
          {hasAccess('clients') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'clients' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('clients'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">group</span>
              <span>العملاء</span>
            </div>
          )}

          {/* Appointments Link */}
          {hasAccess('appointments') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'appointments' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('appointments'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">calendar_today</span>
              <span>المواعيد</span>
            </div>
          )}

          {/* Inspections Link */}
          {hasAccess('inspections') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'inspections' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('inspections'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">assignment</span>
              <span>أوامر المعاينة</span>
            </div>
          )}

          {/* Installations Link */}
          {hasAccess('installations') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'installations' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('installations'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">handyman</span>
              <span>أوامر التركيب</span>
            </div>
          )}

          {/* Maintenance Link */}
          {hasAccess('maintenance') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'maintenance' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('maintenance'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">build</span>
              <span>أوامر الصيانة</span>
            </div>
          )}

          {/* Orders Link */}
          {hasAccess('orders') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'orders' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">shopping_cart</span>
              <span>الطلبات</span>
            </div>
          )}

          {/* Invoices (Bills) Link */}
          {hasAccess('bills') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'bills' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('bills'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">description</span>
              <span>الفواتير</span>
            </div>
          )}

          {/* Products Link */}
          {hasAccess('products') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'products' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">inventory</span>
              <span>المنتجات</span>
            </div>
          )}

          {/* Expenses Link */}
          {hasAccess('expenses') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'expenses' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('expenses'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">payments</span>
              <span>المصروفات</span>
            </div>
          )}

          {/* Employees Link */}
          {hasAccess('employees') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'employees' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('employees'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">badge</span>
              <span>الموظفون</span>
            </div>
          )}

          {/* Reports Link */}
          {hasAccess('reports') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'reports' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">assessment</span>
              <span>التقارير</span>
            </div>
          )}

          {/* Contact Messages Link */}
          {hasAccess('messages') && (
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'messages' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-base">mail</span>
                <span>رسائل التواصل</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-[#b91c1c] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </div>
          )}

          {/* Website Management (Edit) Link */}
          {hasAccess('website_edit') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'website_edit' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('website_edit'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">edit_document</span>
              <span>تعديل الموقع</span>
            </div>
          )}

          {/* Users Management Link */}
          {hasAccess('users') && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
              activeTab === 'users' 
                ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`} onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined text-base">group</span>
              <span>إدارة المستخدمين</span>
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 text-white/60 hover:text-white hover:bg-white/5" onClick={() => { setShowSettings(true); setMobileMenuOpen(false); }}>
            <span className="material-symbols-outlined text-base">settings</span>
            <span>الإعدادات</span>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 text-white/60 hover:text-white hover:bg-white/5" onClick={handleSignOut}>
            <span className="material-symbols-outlined text-base">logout</span>
            <span>تسجيل الخروج</span>
          </div>
        </nav>

        {/* Current user role card indicator at bottom of sidebar */}
        <div className="w-full flex flex-col gap-2 pt-4 border-t border-white/5">
          <div className="bg-[#3E2723]/35 border border-[#d4af37]/25 p-3 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-[#d4af37] text-xl">workspace_premium</span>
            <div className="flex flex-col text-right text-white">
              <span className="text-[9px] opacity-60">الصلاحية الحالية</span>
              <span className="text-xs font-bold">
                {userRole === 'admin' ? 'مدير عام' : 
                 userRole === 'customer_service' ? 'خدمة عملاء' :
                 userRole === 'sales' ? 'مبيعات' :
                 userRole === 'accountant' ? 'محاسب مالي' :
                 userRole === 'technician' ? 'فني تركيبات' : 'موظف'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-white/30 text-center mt-2">Crystal Blinds © 2024</div>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Mobile Header Bar */}
        <div className={styles.mobileBar}>
          <img src="/logo2.png" alt="Crystal Blinds" className={styles.mobileBarLogo} />
          <button className={styles.menuBtn} onClick={() => setMobileMenuOpen(true)}>
            <div className={styles.menuBtnInner}>
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <AdvancedDashboardView
            appointments={appointments}
            orders={orders}
            bills={bills}
            products={products}
            messages={messages}
            unreadCount={unreadCount}
            userRole={userRole}
            userProfile={userProfile}
            setActiveTab={setActiveTab}
            openNewBillModal={openNewBillModal}
            setShowAddModal={setShowAddModal}
            setShowProductModal={setShowProductModal}
            setShowPartnerModal={setShowPartnerModal}
            setShowUserModal={setShowUserModal}
            setShowSettings={setShowSettings}
          />
        ) : activeTab === 'appointments' ? (
          <>
            {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>إدارة المواعيد</h1>
            <p className={styles.headerSub}>إجمالي {appointments.length} موعد · {todayCount} موعد اليوم</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.settingsBtn} onClick={() => setShowSettings(true)}>الإعدادات</button>
            <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>+ إضافة موعد</button>
          </div>
        </header>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'الكل',          value: counts.all,          color: '#d4af37' },
            { label: 'قيد الانتظار',  value: counts.pending,      color: '#b45309' },
            { label: 'مؤكدة',         value: counts.confirmed,    color: '#1d4ed8' },
            { label: 'مكتملة',        value: counts.completed,    color: '#065f46' },
            { label: 'ملغية',         value: counts.cancelled,    color: '#b91c1c' },
            { label: 'معاينات',       value: counts.inspection,   color: '#6d28d9' },
            { label: 'تركيب',         value: counts.installation, color: '#0369a1' },
          ].map(s => (
            <div key={s.label} className={styles.statCard} style={{ borderTopColor: s.color }}>
              <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={styles.filtersRow}>
          <input className={styles.searchInput} placeholder="بحث بالاسم أو الهاتف أو العنوان..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className={styles.filterSelect} value={filterType} onChange={e => setFilterType(e.target.value as FilterType)}>
            <option value="all">كل الأنواع</option>
            <option value="inspection">معاينة</option>
            <option value="installation">تركيب</option>
          </select>
          <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}>
            <option value="all">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
          <div className={styles.dateFilterGroup}>
            <input 
              type="date" 
              className={styles.filterDateInput} 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)} 
            />
            {filterDate && (
              <button className={styles.clearDateBtn} onClick={() => setFilterDate('')}>✕</button>
            )}
          </div>
          <button className={styles.refreshBtn} onClick={fetchAppointments}>تحديث</button>
        </div>

        {/* Table */}
        {loading ? (
          <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
        ) : error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyBox}>لا توجد مواعيد تطابق الفلتر</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>العميل</th><th>الهاتف</th><th>العنوان</th>
                  <th>النوع</th><th>التاريخ</th><th>الوقت</th>
                  <th>الحالة</th><th>تعديل الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className={styles.tableRow} onClick={() => { setSelected(a); setShowModal(true); }}>
                    <td className={styles.clientName}>{a.client_name}</td>
                    <td dir="ltr">{a.client_phone}</td>
                    <td className={styles.addressCell}>{a.client_address}</td>
                    <td><span className={`${styles.badge} ${TYPE_COLORS[a.appointment_type]}`}>{TYPE_LABELS[a.appointment_type]}</span></td>
                    <td>{formatDate(a.appointment_date)}</td>
                    <td dir="ltr">{formatTime(a.appointment_time)}</td>
                    <td><span className={`${styles.badge} ${STATUS_COLORS[a.status]}`}>{STATUS_LABELS[a.status]}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <select className={styles.inlineSelect} value={a.status}
                        onChange={e => updateStatus(a.id, e.target.value as AppointmentStatus)} disabled={saving}>
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </>
        ) : activeTab === 'website_edit' ? (
          <div className={styles.websiteEditContainer}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.headerTitle}>تعديل الموقع</h1>
                <p className={styles.headerSub}>إدارة صور وخلفيات الموقع وشركاء النجاح</p>
              </div>
            </header>

            <div className={styles.subTabsRow}>
              <button 
                type="button"
                className={`${styles.subTab} ${websiteEditSubTab === 'images' ? styles.subTabActive : ''}`}
                onClick={() => setWebsiteEditSubTab('images')}
              >
                صور وخلفيات الموقع
              </button>
              <button 
                type="button"
                className={`${styles.subTab} ${websiteEditSubTab === 'partners' ? styles.subTabActive : ''}`}
                onClick={() => setWebsiteEditSubTab('partners')}
              >
                شركاء النجاح والعملاء
              </button>
            </div>
            
            {websiteEditSubTab === 'images' ? (
              loadingAssets ? (
                <div className={styles.loadingBox}><span className={styles.spinner} />جاري تحميل الصور...</div>
              ) : (
                <div className={styles.assetsGrid}>
                  {websiteAssets.map(asset => (
                    <div key={asset.key} className={styles.assetCard}>
                      <div className={styles.assetImageWrapper}>
                        <img src={asset.url} alt={asset.description || asset.key} className={styles.assetImage} />
                      </div>
                      <div className={styles.assetInfo}>
                        <h3 className={styles.assetTitle}>{asset.description || asset.key}</h3>
                        <p className={styles.assetKey}>{asset.key}</p>
                        
                        <div className={styles.assetActions}>
                          <label className={`${styles.uploadBtn} ${uploadingAsset === asset.key ? styles.uploadingBtn : ''}`}>
                            {uploadingAsset === asset.key ? 'جاري الرفع...' : 'تغيير الصورة'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className={styles.hiddenInput}
                              disabled={uploadingAsset === asset.key}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleUploadImage(asset.key, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {websiteAssets.length === 0 && (
                    <div className={styles.emptyBox}>لم يتم إضافة صور قابلة للتعديل بعد. استخدم ملف الإعدادات لإضافة المفاتيح.</div>
                  )}
                </div>
              )
            ) : (
              loadingPartners ? (
                <div className={styles.loadingBox}><span className={styles.spinner} />جاري تحميل الشركاء...</div>
              ) : (
                <>
                  <div className={styles.filtersRow} style={{ justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                    <strong style={{ color: '#3E2723' }}>شركاء النجاح والعملاء المتميزين ({partners.length})</strong>
                    <button 
                      type="button"
                      className={styles.addBtn} 
                      onClick={() => { setSelectedPartner({ sort_order: (partners.length + 1) * 10 }); setShowPartnerModal(true); }}
                    >
                      + إضافة شريك جديد
                    </button>
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>الشعار</th>
                          <th>الاسم (عربي)</th>
                          <th>الاسم (إنجليزي)</th>
                          <th>الترتيب</th>
                          <th>إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partners.map(partner => (
                          <tr key={partner.id} className={styles.tableRow} onClick={() => { setSelectedPartner(partner); setShowPartnerModal(true); }}>
                            <td>
                              <img src={partner.src} alt={partner.nameEn} style={{ width: 60, height: 40, objectFit: 'contain', background: '#fdfbf7', padding: '4px', borderRadius: '4px', border: '1px solid rgba(62,39,35,0.08)' }} />
                            </td>
                            <td>{partner.nameAr}</td>
                            <td dir="ltr" style={{ textAlign: 'right' }}>{partner.nameEn}</td>
                            <td>{partner.sort_order}</td>
                            <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                type="button"
                                onClick={() => { setSelectedPartner(partner); setShowPartnerModal(true); }} 
                                className={styles.refreshBtn} 
                                style={{ padding: '4px 8px', margin: 0 }}
                              >
                                تعديل
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleDeletePartner(partner.id)} 
                                className={styles.deleteBtn} 
                                style={{ padding: '4px 8px', margin: 0 }}
                              >
                                حذف
                              </button>
                            </td>
                          </tr>
                        ))}
                        {partners.length === 0 && (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>لم يتم إضافة شركاء بعد.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )
            )}
          </div>

        ) : activeTab === 'products' ? (
          <div className={styles.websiteEditContainer}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.headerTitle}>المنتجات</h1>
                <p className={styles.headerSub}>إدارة المنتجات وإضافة منتج جديد</p>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.addBtn} onClick={() => { setSelectedProduct({}); setShowProductModal(true); }}>+ إضافة منتج</button>
              </div>
            </header>

            {/* Bulk Update Section */}
            <div className={styles.filtersRow} style={{ marginTop: '20px', backgroundColor: '#fdfbf7', padding: '15px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
              <strong style={{ marginLeft: '15px', color: '#3E2723' }}>تحديث أسعار قسم بالكامل:</strong>
              <select className={styles.filterSelect} value={bulkCategory} onChange={e => setBulkCategory(e.target.value)}>
                <option value="">اختر القسم...</option>
                {Array.from(new Set(products.map(p => p.category))).filter(Boolean).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input 
                type="number" 
                className={styles.formInput} 
                style={{ width: '150px' }} 
                placeholder="السعر للمتر" 
                value={bulkPrice} 
                onChange={e => setBulkPrice(e.target.value ? Number(e.target.value) : "")} 
              />
              <button 
                className={styles.saveBtn} 
                style={{ padding: '8px 16px', marginRight: 'auto' }} 
                onClick={handleBulkUpdatePrice} 
                disabled={saving || !bulkCategory || bulkPrice === ""}
              >
                {saving ? 'جاري التحديث...' : 'تطبيق'}
              </button>
            </div>
            
            {loadingProducts ? (
              <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>الصورة</th><th>الاسم (عربي)</th><th>القسم</th><th>السعر</th><th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className={styles.tableRow}>
                        <td>{p.images && p.images[0] && <img src={p.images[0]} alt="img" style={{width:40,height:40,objectFit:'cover',borderRadius:4}} />}</td>
                        <td>{p.labelAr}</td>
                        <td>{p.category}</td>
                        <td>{p.price} ج.م</td>
                        <td>
                          <button onClick={() => { setSelectedProduct(p); setShowProductModal(true); }} className={styles.refreshBtn} style={{marginRight:8, padding: '4px 8px'}}>تعديل</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className={styles.deleteBtn} style={{padding: '4px 8px'}}>حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'orders' ? (
          <div className={styles.websiteEditContainer}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.headerTitle}>الطلبات</h1>
                <p className={styles.headerSub}>إدارة طلبات الشراء عبر الموقع</p>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.refreshBtn} onClick={fetchOrders}>تحديث</button>
              </div>
            </header>
            
            {loadingOrders ? (
              <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>رقم الطلب</th><th>العميل</th><th>المنتج</th><th>المقاس</th><th>الإجمالي</th><th>الحالة</th><th>تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className={styles.tableRow} onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }}>
                        <td dir="ltr" style={{ fontSize: '12px' }}>{o.id.split('-')[0]}</td>
                        <td>{o.client_name}<br/><span style={{ fontSize: '12px', color: '#666' }} dir="ltr">{o.client_phone}</span></td>
                        <td>{o.products?.label_ar || 'منتج محذوف'}</td>
                        <td dir="ltr">{o.width}x{o.height} cm</td>
                        <td>{o.total_price} ج.م</td>
                        <td>
                          <span className={`${styles.badge} ${
                            o.status === 'delivered' ? styles.statusCompleted :
                            o.status === 'shipped' ? styles.statusConfirmed :
                            o.status === 'cancelled' ? styles.statusCancelled :
                            styles.statusPending
                          }`}>
                            {o.status === 'pending' ? 'قيد الانتظار' : o.status === 'shipped' ? 'جاري التوصيل' : o.status === 'delivered' ? 'تم التوصيل' : 'ملغي'}
                          </span>
                        </td>
                        <td>
                          <button className={styles.refreshBtn} style={{padding: '4px 8px'}} onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); setShowOrderModal(true); }}>عرض</button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={7} style={{textAlign:'center', padding:'20px'}}>لا توجد طلبات بعد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'bills' ? (
          <div className={styles.websiteEditContainer}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.headerTitle}>إدارة الفواتير</h1>
                <p className={styles.headerSub}>إنشاء وطباعة وحفظ فواتير المبيعات</p>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.addBtn} onClick={openNewBillModal}>+ إضافة فاتورة جديدة</button>
              </div>
            </header>

            <div className={styles.filtersRow}>
              <input 
                className={styles.searchInput} 
                placeholder="بحث باسم العميل أو رقم الفاتورة..." 
                value={billsSearch} 
                onChange={e => setBillsSearch(e.target.value)} 
              />
              <button className={styles.refreshBtn} onClick={fetchBills}>تحديث</button>
            </div>

            {loadingBills ? (
              <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>رقم الفاتورة</th>
                      <th>اسم العميل</th>
                      <th>رقم الهاتف</th>
                      <th>تاريخ الفاتورة</th>
                      <th>الإجمالي</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.filter(b => {
                      if (!billsSearch) return true;
                      const q = billsSearch.toLowerCase();
                      return b.client_name.toLowerCase().includes(q) || 
                             b.invoice_number.toLowerCase().includes(q) || 
                             (b.client_phone && b.client_phone.includes(q));
                    }).map(b => (
                      <tr key={b.id} className={styles.tableRow} onClick={() => { setSelectedBill(b); setShowBillModal(true); }}>
                        <td dir="ltr" style={{ fontWeight: 'bold' }}>{b.invoice_number}</td>
                        <td>{b.client_name}</td>
                        <td dir="ltr">{b.client_phone || '—'}</td>
                        <td>{new Date(b.created_at || b.updated_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td style={{ color: '#b45309', fontWeight: 'bold' }}>{b.final_total} ج.م</td>
                        <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handlePrint(b)} className={styles.refreshBtn} style={{ padding: '4px 8px', margin: 0 }}>طباعة</button>
                          <button onClick={() => handlePrint(b)} className={styles.downloadBtn} style={{ padding: '4px 8px', margin: 0 }}>تنزيل PDF</button>
                          <button onClick={() => handleDeleteBill(b.id)} className={styles.deleteBtn} style={{ padding: '4px 8px', margin: 0 }}>حذف</button>
                        </td>
                      </tr>
                    ))}
                    {bills.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>لا توجد فواتير بعد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'messages' ? (
          <div className={styles.websiteEditContainer}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.headerTitle}>رسائل التواصل</h1>
                <p className={styles.headerSub}>عرض وإدارة الرسائل المستلمة من صفحة اتصل بنا</p>
              </div>
              <div className={styles.headerActions}>
                <button type="button" className={styles.refreshBtn} onClick={fetchMessages}>تحديث</button>
              </div>
            </header>

            {loadingMessages ? (
              <div className={styles.loadingBox}><span className={styles.spinner} />جاري تحميل الرسائل...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>رقم الهاتف</th>
                      <th>البريد الإلكتروني</th>
                      <th>الرسالة</th>
                      <th>التاريخ</th>
                      <th>الحالة</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(msg => (
                      <tr 
                        key={msg.id} 
                        className={styles.tableRow} 
                        style={{ fontWeight: msg.is_read ? 'normal' : 'bold', backgroundColor: msg.is_read ? 'transparent' : '#fffbeb' }}
                        onClick={() => { setSelectedMessage(msg); setShowMessageModal(true); if(!msg.is_read) markMessageAsRead(msg.id, true); }}
                      >
                        <td>{msg.name}</td>
                        <td dir="ltr" style={{ textAlign: 'right' }}>{msg.phone}</td>
                        <td dir="ltr" style={{ textAlign: 'right' }}>{msg.email || '—'}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</td>
                        <td>{new Date(msg.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <span className={`${styles.badge} ${msg.is_read ? styles.statusCompleted : styles.statusPending}`}>
                            {msg.is_read ? 'مقروءة' : 'جديدة'}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            type="button"
                            onClick={() => { setSelectedMessage(msg); setShowMessageModal(true); if(!msg.is_read) markMessageAsRead(msg.id, true); }} 
                            className={styles.refreshBtn} 
                            style={{ padding: '4px 8px', margin: 0 }}
                          >
                            عرض
                          </button>
                          <button 
                            type="button"
                            onClick={() => markMessageAsRead(msg.id, !msg.is_read)} 
                            className={styles.settingsBtn} 
                            style={{ padding: '4px 8px', margin: 0 }}
                          >
                            {msg.is_read ? 'غير مقروءة' : 'مقروءة'}
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)} 
                            className={styles.deleteBtn} 
                            style={{ padding: '4px 8px', margin: 0 }}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                    {messages.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>لا توجد رسائل مستلمة بعد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'users' && userRole === 'admin' ? (
          <div className={styles.websiteEditContainer}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.headerTitle}>إدارة المستخدمين</h1>
                <p className={styles.headerSub}>إضافة وحذف وتعديل أدوار موظفي لوحة التحكم</p>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.addBtn} onClick={() => { setNewUser({ name: '', email: '', password: '', role: 'employee' }); setShowUserModal(true); }}>+ إضافة مستخدم جديد</button>
              </div>
            </header>

            {loadingUsers ? (
              <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>البريد الإلكتروني</th>
                      <th>الصلاحية</th>
                      <th>تاريخ الإنشاء</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className={styles.tableRow}>
                        <td style={{ fontWeight: 'bold' }}>{u.name || '—'}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`${styles.badge} ${u.role === 'admin' ? styles.statusConfirmed : styles.statusPending}`}>
                            {u.role === 'admin' ? 'مدير (Admin)' : 'موظف (Employee)'}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteUser(u.id)} 
                            className={styles.deleteBtn} 
                            style={{ padding: '4px 8px', margin: 0 }}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>لا يوجد مستخدمون بعد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'clients' ? (
          <ClientsView />
        ) : activeTab === 'inspections' ? (
          <InspectionsView userRole={userRole} userProfile={userProfile} />
        ) : activeTab === 'installations' ? (
          <InstallationsView userRole={userRole} />
        ) : activeTab === 'maintenance' ? (
          <MaintenanceView userRole={userRole} />
        ) : activeTab === 'expenses' ? (
          <ExpensesView />
        ) : activeTab === 'employees' ? (
          <EmployeesView />
        ) : activeTab === 'reports' ? (
          <ReportsView />
        ) : null}
      </main>


      {/* ── Product Modal ── */}
      {showProductModal && selectedProduct && (
        <div className={styles.overlay} onClick={() => setShowProductModal(false)}>
          <div className={styles.modal} style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedProduct.id ? 'تعديل المنتج' : 'إضافة منتج'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الاسم (عربي) *</label>
                  <input className={styles.formInput} value={selectedProduct.labelAr || ''} onChange={e => setSelectedProduct({ ...selectedProduct, labelAr: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الاسم (إنجليزي) *</label>
                  <input className={styles.formInput} dir="ltr" value={selectedProduct.labelEn || ''} onChange={e => setSelectedProduct({ ...selectedProduct, labelEn: e.target.value })} />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>القسم</label>
                  <input className={styles.formInput} dir="ltr" value={selectedProduct.category || ''} onChange={e => setSelectedProduct({ ...selectedProduct, category: e.target.value })} placeholder="مثال: Roller, Smart, Classic" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>السعر</label>
                  <input className={styles.formInput} type="number" value={selectedProduct.price || 0} onChange={e => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })} />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>الوصف القصير (عربي)</label>
                  <input className={styles.formInput} value={selectedProduct.descAr || ''} onChange={e => setSelectedProduct({ ...selectedProduct, descAr: e.target.value })} />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>الوصف القصير (إنجليزي)</label>
                  <input className={styles.formInput} dir="ltr" value={selectedProduct.descEn || ''} onChange={e => setSelectedProduct({ ...selectedProduct, descEn: e.target.value })} />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>التفاصيل (عربي)</label>
                  <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={selectedProduct.detailsAr || ''} onChange={e => setSelectedProduct({ ...selectedProduct, detailsAr: e.target.value })} />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>التفاصيل (إنجليزي)</label>
                  <textarea className={`${styles.formInput} ${styles.formTextarea}`} dir="ltr" value={selectedProduct.detailsEn || ''} onChange={e => setSelectedProduct({ ...selectedProduct, detailsEn: e.target.value })} />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>الصور المرفوعة ({selectedProduct.images?.length || 0})</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {selectedProduct.images?.map((img, i) => (
                      <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <img src={img} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} alt="prod" />
                        <span style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          background: i === 0 ? 'rgba(62, 39, 35, 0.85)' : i === 1 ? 'rgba(212, 175, 55, 0.85)' : 'rgba(107, 114, 128, 0.85)',
                          color: 'white',
                          fontSize: '8.5px',
                          textAlign: 'center',
                          padding: '2px 0',
                          borderBottomLeftRadius: '4px',
                          borderBottomRightRadius: '4px',
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {i === 0 ? 'الأساسية' : i === 1 ? 'صورة الهوفر' : 'صورة إضافية'}
                        </span>
                        <button onClick={() => setSelectedProduct({ ...selectedProduct, images: selectedProduct.images!.filter((_, index) => index !== i)})} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', border: 'none', cursor: 'pointer', zIndex: 10 }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <label className={styles.uploadBtn}>
                    {uploadingProductImage ? 'جاري الرفع...' : '+ رفع صورة جديدة'}
                    <input type="file" accept="image/*" className={styles.hiddenInput} disabled={uploadingProductImage} onChange={e => { if (e.target.files?.[0]) handleUploadProductImage(e.target.files[0]); }} />
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>
                    <input type="checkbox" checked={selectedProduct.is_active !== false} onChange={e => setSelectedProduct({ ...selectedProduct, is_active: e.target.checked })} style={{ marginLeft: '8px' }} />
                    المنتج متاح (إلغاء التحديد يجعله نفذ من الكمية)
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>الألوان المتاحة</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedProduct.colors || []).map((color, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f9f9f9', padding: '10px', borderRadius: '4px', flexWrap: 'wrap' }}>
                        <input type="color" value={color.hex} onChange={e => {
                          const newColors = [...(selectedProduct.colors || [])];
                          newColors[i].hex = e.target.value;
                          setSelectedProduct({ ...selectedProduct, colors: newColors });
                        }} style={{ width: '40px', height: '40px', cursor: 'pointer' }} />
                        <input className={styles.formInput} placeholder="الاسم (عربي)" value={color.nameAr} onChange={e => {
                          const newColors = [...(selectedProduct.colors || [])];
                          newColors[i].nameAr = e.target.value;
                          setSelectedProduct({ ...selectedProduct, colors: newColors });
                        }} style={{ width: '120px' }} />
                        <input className={styles.formInput} placeholder="Name (En)" value={color.nameEn} onChange={e => {
                          const newColors = [...(selectedProduct.colors || [])];
                          newColors[i].nameEn = e.target.value;
                          setSelectedProduct({ ...selectedProduct, colors: newColors });
                        }} dir="ltr" style={{ width: '120px' }} />
                        <label style={{ fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="checkbox" checked={color.isSoldOut} onChange={e => {
                            const newColors = [...(selectedProduct.colors || [])];
                            newColors[i].isSoldOut = e.target.checked;
                            setSelectedProduct({ ...selectedProduct, colors: newColors });
                          }} /> نفذت الكمية
                        </label>
                        {color.image && <img src={color.image} alt="color" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <label className={styles.uploadBtn} style={{ padding: '6px 12px', fontSize: '12px', margin: 0 }}>
                          رفع صورة
                          <input type="file" accept="image/*" className={styles.hiddenInput} onChange={async e => {
                            if (e.target.files?.[0]) {
                              const file = e.target.files[0];
                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `color-${Date.now()}.${fileExt}`;
                                const { error: uploadError } = await supabase.storage.from('product_images').upload(fileName, file);
                                if (uploadError) throw uploadError;
                                const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(fileName);
                                const newColors = [...(selectedProduct.colors || [])];
                                newColors[i].image = publicUrlData.publicUrl;
                                setSelectedProduct({ ...selectedProduct, colors: newColors });
                              } catch (err) { alert('فشل رفع الصورة'); }
                            }
                          }} />
                        </label>
                        <button onClick={() => {
                          const newColors = [...(selectedProduct.colors || [])];
                          newColors.splice(i, 1);
                          setSelectedProduct({ ...selectedProduct, colors: newColors });
                        }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>حذف</button>
                      </div>
                    ))}
                    <button onClick={() => {
                      setSelectedProduct({
                        ...selectedProduct,
                        colors: [...(selectedProduct.colors || []), { id: Date.now().toString(), nameEn: '', nameAr: '', hex: '#000000', isSoldOut: false }]
                      });
                    }} style={{ background: '#d4af37', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', width: 'max-content' }}>+ إضافة لون جديد</button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleSaveProduct} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ المنتج'}</button>
              <button className={styles.cancelBtn} onClick={() => setShowProductModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Modal ── */}
      {showOrderModal && selectedOrder && (
        <div className={styles.overlay} onClick={() => setShowOrderModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>تفاصيل الطلب</h2>
              <button className={styles.closeBtn} onClick={() => setShowOrderModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}><span className={styles.detailLabel}>رقم الطلب</span><span dir="ltr">{selectedOrder.id}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>المنتج</span><span>{selectedOrder.products?.label_ar || 'غير متاح'}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>اسم العميل</span><span>{selectedOrder.client_name}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الهاتف</span><span dir="ltr">{selectedOrder.client_phone}</span></div>
                <div className={`${styles.detailItem} ${styles.detailFull}`}><span className={styles.detailLabel}>العنوان</span><span>{selectedOrder.client_address}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>المقاس (عرض × طول)</span><span dir="ltr">{selectedOrder.width} × {selectedOrder.height} سم</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>عدد القطع</span><span>{selectedOrder.pieces}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>لون / نوع</span><span>كود اللون: {selectedOrder.color_id} | كود النوع: {selectedOrder.type_id}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الإجمالي</span><span style={{color: '#b45309', fontWeight: 'bold'}}>{selectedOrder.total_price} ج.م</span></div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>طريقة الدفع</span>
                  <span>
                    {selectedOrder.payment_method === 'wallet_instapay'
                      ? 'المحفظة الإلكترونية / إنستا باي'
                      : 'الدفع عند الاستلام'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>الحالة</span>
                  <select className={styles.modalSelect} value={selectedOrder.status}
                    onChange={e => updateOrderStatus(selectedOrder.id, e.target.value)} disabled={saving}>
                    <option value="pending">قيد الانتظار</option>
                    <option value="shipped">جاري التوصيل</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>

                {selectedOrder.payment_method === 'wallet_instapay' && (
                  <>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>رقم واتساب للتواصل</span>
                      <span>
                        {selectedOrder.whatsapp_number ? (
                          <a
                            href={`https://wa.me/${selectedOrder.whatsapp_number.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsappLink}
                          >
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            {selectedOrder.whatsapp_number}
                          </a>
                        ) : '—'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>حالة الدفع</span>
                      <span className={`${styles.badge} ${
                        selectedOrder.payment_status === 'success' ? styles.statusCompleted :
                        selectedOrder.payment_status === 'failed' ? styles.statusCancelled :
                        styles.statusPending
                      }`}>
                        {selectedOrder.payment_status === 'success' ? 'مقبول (تم تأكيد الدفع)' :
                         selectedOrder.payment_status === 'failed' ? 'مرفوض' :
                         'قيد المراجعة'}
                      </span>
                    </div>
                    <div className={`${styles.detailItem} ${styles.detailFull}`}>
                      <span className={styles.detailLabel} style={{ marginBottom: '8px' }}>إيصال التحويل</span>
                      <div>
                        {selectedOrder.transaction_image_url ? (
                          <a href={selectedOrder.transaction_image_url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={selectedOrder.transaction_image_url}
                              alt="إيصال التحويل"
                              className={styles.receiptThumbnail}
                            />
                          </a>
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>لم يتم إرفاق إيصال!</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              {selectedOrder.payment_method === 'wallet_instapay' && (
                <>
                  {selectedOrder.payment_status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
                      <button
                        onClick={() => updateOrderPaymentStatus(selectedOrder.id, 'success')}
                        className={styles.confirmPayBtn}
                        disabled={saving}
                      >
                        {saving ? 'جاري التأكيد...' : 'تأكيد الدفع'}
                      </button>
                      <button
                        onClick={() => updateOrderPaymentStatus(selectedOrder.id, 'failed')}
                        className={styles.rejectPayBtn}
                        disabled={saving}
                      >
                        {saving ? 'جاري الرفض...' : 'رفض الدفع'}
                      </button>
                    </div>
                  )}
                  {selectedOrder.payment_status === 'success' && (
                    <a
                      href={getWhatsAppMessageLink(selectedOrder, true)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappNotifyBtn}
                      style={{ marginRight: 'auto' }}
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      إرسال إشعار النجاح (واتساب)
                    </a>
                  )}
                  {selectedOrder.payment_status === 'failed' && (
                    <a
                      href={getWhatsAppMessageLink(selectedOrder, false)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappNotifyBtn}
                      style={{ marginRight: 'auto', backgroundColor: '#ef4444' }}
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      إرسال إشعار الرفض (واتساب)
                    </a>
                  )}
                </>
              )}
              <button className={styles.cancelBtn} onClick={() => setShowOrderModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showModal && selected && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>تفاصيل الموعد</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الاسم</span><span>{selected.client_name}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الهاتف</span><span dir="ltr">{selected.client_phone}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>العنوان</span><span>{selected.client_address}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>النوع</span><span className={`${styles.badge} ${TYPE_COLORS[selected.appointment_type]}`}>{TYPE_LABELS[selected.appointment_type]}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>التاريخ</span><span>{formatDate(selected.appointment_date)}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الوقت</span><span dir="ltr">{formatTime(selected.appointment_time)}</span></div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>الحالة</span>
                  <select className={styles.modalSelect} value={selected.status}
                    onChange={e => updateStatus(selected.id, e.target.value as AppointmentStatus)} disabled={saving}>
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
                {selected.appointment_type === 'installation' && selected.curtain_type && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>نوع الستائر</span>
                    <span>{CURTAIN_LABELS[selected.curtain_type] || selected.curtain_type}</span>
                  </div>
                )}
                {selected.notes && (
                  <div className={`${styles.detailItem} ${styles.detailFull}`}>
                    <span className={styles.detailLabel}>ملاحظات</span><span>{selected.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.deleteBtn} onClick={() => deleteAppointment(selected.id)}>حذف الموعد</button>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Modal ── */}
      {showAddModal && (
        <div className={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>إضافة موعد جديد</h2>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>اسم العميل *</label>
                  <input className={styles.formInput} value={newAppt.client_name} onChange={e => setNewAppt(p => ({ ...p, client_name: e.target.value }))} placeholder="الاسم الكامل" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>رقم الهاتف *</label>
                  <input className={styles.formInput} dir="ltr" value={newAppt.client_phone} onChange={e => setNewAppt(p => ({ ...p, client_phone: e.target.value }))} placeholder="01xxxxxxxxx" />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>العنوان</label>
                  <input className={styles.formInput} value={newAppt.client_address} onChange={e => setNewAppt(p => ({ ...p, client_address: e.target.value }))} placeholder="العنوان التفصيلي" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>نوع الموعد *</label>
                  <select className={styles.formInput} value={newAppt.appointment_type} onChange={e => setNewAppt(p => ({ ...p, appointment_type: e.target.value as AppointmentType }))}>
                    <option value="inspection">معاينة</option>
                    <option value="installation">تركيب</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>التاريخ *</label>
                  <input className={styles.formInput} type="date" value={newAppt.appointment_date} onChange={e => setNewAppt(p => ({ ...p, appointment_date: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الوقت *</label>
                  <input className={styles.formInput} type="time" value={newAppt.appointment_time} onChange={e => setNewAppt(p => ({ ...p, appointment_time: e.target.value }))} />
                </div>
                {newAppt.appointment_type === 'installation' && (
                  <div className={`${styles.formGroup} ${styles.formFull}`}>
                    <label className={styles.formLabel}>نوع الستائر *</label>
                    <select className={styles.formInput} value={newAppt.curtain_type} onChange={e => setNewAppt(p => ({ ...p, curtain_type: e.target.value }))}>
                      <option value="">اختر النوع</option>
                      {Object.entries(CURTAIN_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>ملاحظات</label>
                  <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={newAppt.notes} onChange={e => setNewAppt(p => ({ ...p, notes: e.target.value }))} placeholder="أي ملاحظات إضافية..." />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={addAppointment} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ الموعد'}</button>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div className={styles.overlay} onClick={() => { setShowSettings(false); setSettingsMsg(null); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>إعدادات الحساب</h2>
              <button className={styles.closeBtn} onClick={() => { setShowSettings(false); setSettingsMsg(null); }}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>البريد الإلكتروني الجديد</label>
                  <input className={styles.formInput} type="email" dir="ltr" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@example.com" />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>كلمة المرور الجديدة</label>
                  <input className={styles.formInput} type="password" dir="ltr" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                </div>
              </div>
              {settingsMsg && (
                <div style={{ marginTop: '1rem' }} className={settingsMsg.type === 'success' ? styles.successMsg : styles.loginError}>
                  {settingsMsg.text}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleUpdateCredentials} disabled={settingsSaving}>
                {settingsSaving ? 'جاري الحفظ...' : 'تحديث البيانات'}
              </button>
              <button className={styles.cancelBtn} onClick={() => { setShowSettings(false); setSettingsMsg(null); }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bill Modal ── */}
      {showBillModal && selectedBill && (
        <div className={styles.overlay} onClick={() => setShowBillModal(false)}>
          <div className={styles.modal} style={{ width: '95vw', maxWidth: '1300px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedBill.id ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowBillModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody} style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* Manual vs Import Selector (only for new bills) */}
              {!selectedBill.id && (
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#3E2723' }}>نوع الفاتورة:</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer', color: '#3E2723', fontWeight: 'bold' }}>
                    <input 
                      type="radio" 
                      name="billCreationMode" 
                      checked={billCreationMode === 'manual'} 
                      onChange={() => setBillCreationMode('manual')} 
                    />
                    إنشاء يدوي
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer', color: '#3E2723', fontWeight: 'bold' }}>
                    <input 
                      type="radio" 
                      name="billCreationMode" 
                      checked={billCreationMode === 'order'} 
                      onChange={() => {
                        setBillCreationMode('order');
                        setSelectedBill(prev => prev ? { ...prev, client_name: '', client_phone: '', client_address: '', order_number: '', items: [] } : null);
                      }} 
                    />
                    استيراد من الطلبات
                  </label>
                </div>
              )}

              {/* Order Import Dropdown */}
              {!selectedBill.id && billCreationMode === 'order' && (
                <div className={styles.formGroup} style={{ gridColumn: 'span 2', marginBottom: '20px' }}>
                  <label className={styles.formLabel} style={{ fontWeight: 'bold', color: '#b45309' }}>اختر الطلب لاستيراد البيانات *</label>
                  <select 
                    className={styles.formInput} 
                    onChange={e => handleImportOrder(e.target.value)}
                    defaultValue=""
                    style={{ border: '1.5px solid #d4af37', background: '#fffbeb' }}
                  >
                    <option value="">-- اختر طلب العميل --</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.client_name} - {o.products?.label_ar || 'منتج'} (عرض {o.width} × طول {o.height} سم) - الإجمالي: {o.total_price} ج.م
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>رقم الفاتورة *</label>
                  <input className={styles.formInput} value={selectedBill.invoice_number || ''} onChange={e => updateBillField('invoice_number', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>اسم العميل *</label>
                  <input className={styles.formInput} value={selectedBill.client_name || ''} onChange={e => updateBillField('client_name', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>رقم الهاتف</label>
                  <input className={styles.formInput} dir="ltr" value={selectedBill.client_phone || ''} onChange={e => updateBillField('client_phone', e.target.value)} placeholder="01xxxxxxxxx" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>العنوان</label>
                  <input className={styles.formInput} value={selectedBill.client_address || ''} onChange={e => updateBillField('client_address', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>رقم الطلب</label>
                  <input className={styles.formInput} value={selectedBill.order_number || ''} onChange={e => updateBillField('order_number', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>طريقة الدفع</label>
                  <select className={styles.formInput} value={selectedBill.payment_method || 'نقدي'} onChange={e => updateBillField('payment_method', e.target.value)}>
                    <option value="نقدي">نقدي</option>
                    <option value="فيزا">فيزا</option>
                    <option value="شيك">شيك</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>موعد التسليم</label>
                  <input className={styles.formInput} type="date" value={selectedBill.delivery_date || ''} onChange={e => updateBillField('delivery_date', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>ملاحظات</label>
                  <input className={styles.formInput} value={selectedBill.notes || ''} onChange={e => updateBillField('notes', e.target.value)} placeholder="ملاحظات إضافية للفاتورة" />
                </div>
              </div>

              {/* Items Section */}
              <div style={{ marginTop: '20px' }}>
                <h3 className={styles.modalTitle} style={{ marginBottom: '10px' }}>بنود الفاتورة</h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.billItemsTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '25%' }}>الصنف / النوع</th>
                        <th style={{ width: '18%' }}>طريقة الحساب</th>
                        <th style={{ width: '10%' }}>العرض (م)</th>
                        <th style={{ width: '10%' }}>الطول (م)</th>
                        <th style={{ width: '8%' }}>العدد</th>
                        <th style={{ width: '12%' }}>السعر (ج.م)</th>
                        <th style={{ width: '12%' }}>الإجمالي (ج.م)</th>
                        <th style={{ width: '5%' }}>حذف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedBill.items || []).map((item, index) => (
                        <tr key={index}>
                          <td>
                            <select 
                              value={item.name} 
                              onChange={e => handleProductSelect(index, e.target.value)}
                              className={styles.formInput}
                              style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', background: 'white', textAlign: 'right' }}
                            >
                              <option value="">-- اختر المنتج --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.labelAr}>
                                  {p.labelAr}
                                </option>
                              ))}
                              {item.name && !products.some(p => p.labelAr === item.name) && (
                                <option value={item.name}>{item.name}</option>
                              )}
                            </select>
                          </td>
                          <td>
                            <select 
                              value={item.calcType} 
                              onChange={e => updateBillItemField(index, 'calcType', e.target.value)}
                            >
                              <option value="square_meter">متر مربع</option>
                              <option value="linear_width">طولي (عرض)</option>
                              <option value="linear_height">طولي (ارتفاع)</option>
                              <option value="unit">بالقطعة</option>
                            </select>
                          </td>
                          <td>
                            <input 
                              type="number" 
                              step="0.01" 
                              value={item.width} 
                              onChange={e => updateBillItemField(index, 'width', e.target.value)} 
                              disabled={item.calcType === 'unit' || item.calcType === 'linear_height'}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              step="0.01" 
                              value={item.height} 
                              onChange={e => updateBillItemField(index, 'height', e.target.value)} 
                              disabled={item.calcType === 'unit' || item.calcType === 'linear_width'}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              value={item.quantity} 
                              onChange={e => updateBillItemField(index, 'quantity', e.target.value)} 
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              value={item.price} 
                              onChange={e => updateBillItemField(index, 'price', e.target.value)} 
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              value={item.total} 
                              onChange={e => updateBillItemField(index, 'total', e.target.value)} 
                            />
                          </td>
                          <td>
                            <button 
                              onClick={() => removeBillItem(index)} 
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(selectedBill.items || []).length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ color: '#9ca3af', padding: '15px' }}>
                            لا توجد بنود بعد. اضغط على "إضافة بند" في الأسفل.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={addItemToBill} 
                  style={{ background: '#3E2723', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  + إضافة بند جديد
                </button>
              </div>

              {/* Totals Section */}
              <div className={styles.totalsGrid}>
                <div className={styles.totalsCol}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>الخصم (ج.م)</label>
                    <input type="number" className={styles.formInput} value={selectedBill.discount || 0} onChange={e => updateBillField('discount', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>تكلفة التركيب (ج.م)</label>
                    <input type="number" className={styles.formInput} value={selectedBill.installation_cost || 0} onChange={e => updateBillField('installation_cost', e.target.value)} />
                  </div>
                </div>

                <div className={styles.totalsCol}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>تكلفة النقل (ج.م)</label>
                    <input type="number" className={styles.formInput} value={selectedBill.transport_cost || 0} onChange={e => updateBillField('transport_cost', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>المدفوع / العربون (ج.م)</label>
                    <input type="number" className={styles.formInput} value={selectedBill.deposit || 0} onChange={e => updateBillField('deposit', e.target.value)} />
                  </div>
                </div>

                <div className={styles.totalsCol} style={{ justifyContent: 'center', borderRight: '1px solid #e5e7eb', paddingRight: '20px' }}>
                  <div className={styles.totalsRow}>
                    <span>إجمالي الأصناف:</span>
                    <span>{Number(selectedBill.total_items_price || 0).toFixed(2)} ج.م</span>
                  </div>
                  <div className={styles.totalsRow}>
                    <span>المدفوع / العربون:</span>
                    <span>{Number(selectedBill.deposit || 0).toFixed(2)} ج.م</span>
                  </div>
                  <div className={`${styles.totalsRow} ${styles.totalsRowStrong}`}>
                    <span>الإجمالي النهائي:</span>
                    <span>{Number(selectedBill.final_total || 0).toFixed(2)} ج.م</span>
                  </div>
                  <div className={`${styles.totalsRow} ${styles.totalsRowStrong}`} style={{ color: '#d4af37' }}>
                    <span>المتبقي:</span>
                    <span>{Number(selectedBill.remaining_amount || 0).toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {selectedBill.id && (
                <button 
                  type="button"
                  className={styles.downloadBtn} 
                  onClick={() => {
                    const billObj = bills.find(b => b.id === selectedBill.id);
                    if (billObj) handlePrint(billObj);
                  }}
                  style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  طباعة وتحميل PDF
                </button>
              )}
              <button className={styles.saveBtn} onClick={handleSaveBill} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ الفاتورة'}</button>
              <button className={styles.cancelBtn} onClick={() => setShowBillModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Partner Modal ── */}
      {showPartnerModal && selectedPartner && (
        <div className={styles.overlay} onClick={() => setShowPartnerModal(false)}>
          <div className={styles.modal} style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedPartner.id ? 'تعديل الشريك' : 'إضافة شريك جديد'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowPartnerModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الاسم (عربي) *</label>
                  <input className={styles.formInput} value={selectedPartner.nameAr || ''} onChange={e => setSelectedPartner({ ...selectedPartner, nameAr: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الاسم (إنجليزي) *</label>
                  <input className={styles.formInput} dir="ltr" value={selectedPartner.nameEn || ''} onChange={e => setSelectedPartner({ ...selectedPartner, nameEn: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الترتيب *</label>
                  <input className={styles.formInput} type="number" value={selectedPartner.sort_order ?? 0} onChange={e => setSelectedPartner({ ...selectedPartner, sort_order: Number(e.target.value) })} />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>شعار الشريك (الصورة) *</label>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
                    {selectedPartner.src ? (
                      <div style={{ position: 'relative', width: '120px', height: '80px', border: '1px solid #e5e9f0', borderRadius: '6px', overflow: 'hidden', background: '#fdfbf7', padding: '5px' }}>
                        <img src={selectedPartner.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="partner logo" />
                      </div>
                    ) : (
                      <div style={{ width: '120px', height: '80px', border: '2px dashed #e5e9f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.8rem', background: '#f9fafb' }}>
                        لا توجد صورة
                      </div>
                    )}
                    <label className={styles.uploadBtn} style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem' }}>
                      {uploadingPartnerLogo ? 'جاري الرفع...' : selectedPartner.src ? 'تغيير الصورة' : 'رفع الصورة'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className={styles.hiddenInput} 
                        disabled={uploadingPartnerLogo} 
                        onChange={e => { if (e.target.files?.[0]) handleUploadPartnerLogo(e.target.files[0]); }} 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleSavePartner} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ البيانات'}</button>
              <button className={styles.cancelBtn} onClick={() => setShowPartnerModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Message Details Modal ── */}
      {showMessageModal && selectedMessage && (
        <div className={styles.overlay} onClick={() => setShowMessageModal(false)}>
          <div className={styles.modal} style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>تفاصيل رسالة التواصل</h2>
              <button className={styles.closeBtn} onClick={() => setShowMessageModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid} style={{ gridTemplateColumns: '1fr' }}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>اسم المرسل</span>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#3E2723' }}>{selectedMessage.name}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>رقم الهاتف</span>
                    <span dir="ltr" style={{ textAlign: 'right', fontWeight: '600' }}>{selectedMessage.phone}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>البريد الإلكتروني</span>
                    <span dir="ltr" style={{ textAlign: 'right', color: selectedMessage.email ? 'inherit' : '#9ca3af' }}>{selectedMessage.email || 'لا يوجد'}</span>
                  </div>
                </div>

                <div className={styles.detailItem} style={{ marginTop: '0.5rem' }}>
                  <span className={styles.detailLabel}>تاريخ الإرسال</span>
                  <span>{new Date(selectedMessage.created_at).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className={styles.detailItem} style={{ marginTop: '1rem', background: '#fdfbf7', padding: '15px', borderRadius: '8px', border: '1px solid rgba(62,39,35,0.08)' }}>
                  <span className={styles.detailLabel} style={{ marginBottom: '8px' }}>نص الرسالة</span>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.92rem', color: '#1e2532', margin: 0 }}>{selectedMessage.message}</p>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'space-between' }}>
              <button 
                type="button"
                className={styles.deleteBtn} 
                onClick={() => handleDeleteMessage(selectedMessage.id)}
              >
                حذف الرسالة
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button"
                  className={styles.settingsBtn} 
                  onClick={() => markMessageAsRead(selectedMessage.id, !selectedMessage.is_read)}
                >
                  {selectedMessage.is_read ? 'تعليم كغير مقروءة' : 'تعليم كمقروءة'}
                </button>
                <button 
                  type="button"
                  className={styles.cancelBtn} 
                  onClick={() => setShowMessageModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── User Modal ── */}
      {showUserModal && (
        <div className={styles.overlay} onClick={() => setShowUserModal(false)}>
          <div className={styles.modal} style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>إضافة مستخدم جديد</h2>
              <button className={styles.closeBtn} onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الاسم كامل *</label>
                  <input 
                    className={styles.formInput} 
                    value={newUser.name} 
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })} 
                    placeholder="أدخل اسم الموظف"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>البريد الإلكتروني *</label>
                  <input 
                    className={styles.formInput} 
                    type="email"
                    dir="ltr"
                    value={newUser.email} 
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
                    placeholder="employee@crystalblinds.com"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>كلمة المرور *</label>
                  <input 
                    className={styles.formInput} 
                    type="password"
                    dir="ltr"
                    value={newUser.password} 
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الصلاحية / الدور *</label>
                  <select 
                    className={styles.formInput} 
                    value={newUser.role} 
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    style={{ outline: 'none', background: 'white' }}
                  >
                    <option value="employee">موظف (Employee) - صلاحيات محدودة</option>
                    <option value="admin">مدير (Admin) - صلاحيات كاملة</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleSaveUser} disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'إنشاء الحساب'}
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowUserModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>



    {/* ── Print Area (Outside .shell for print formatting) ── */}
    {selectedBillForPrint && (
      <div className={styles.printInvoiceArea} dir="rtl">
        {/* Top Header Section */}
        <div className={styles.invoiceHeaderNew}>
          {/* Logo on top left */}
          <div className={styles.logoBlock}>
            <div className={styles.logoWrapper}>
              <img src="/logo.png" className={styles.brandLogoNew} alt="Crystal Blinds Logo" />
            </div>
          </div>
          
          {/* Company details on top right */}
          <div className={styles.companyInfoBlock} dir="ltr">
            <h2 className={styles.companyNameEn}>Crystal Blinds</h2>
            <p className={styles.companyAddressEn}>2 shebeen st. salah el dien square</p>
            <p className={styles.companyAddressEn}>heliopolis, Cairo</p>
            <p className={styles.companyAddressEn}>Egypt</p>
            <p className={styles.companyPhoneEn}>Tel: 01100080609 / 01020909498</p>
          </div>
        </div>

        {/* Decorative Wave/Line */}
        <div className={styles.headerDecorativeWave} />

        {/* Title Block */}
        <div className={styles.titleContainer}>
          <div className={styles.titleLeftAr}>معرض كريستال للستائر</div>
          <div className={styles.titleRightEn}>
            <span className={styles.titleProforma}>PROFORMA Invoice</span>{' '}
            <span className={styles.titleInvoiceNum}>{selectedBillForPrint.invoice_number}</span>
          </div>
        </div>

        {/* Metadata Pill Box */}
        <div className={styles.metaPillBox}>
          <div className={styles.metaPillCol}>
            <span className={styles.metaLabel}>Invoice Date</span>
            <span className={styles.metaVal}>
              {new Date(selectedBillForPrint.created_at || selectedBillForPrint.updated_at).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className={styles.metaPillCol}>
            <span className={styles.metaLabel}>Due Date</span>
            <span className={styles.metaVal}>
              {selectedBillForPrint.delivery_date 
                ? new Date(selectedBillForPrint.delivery_date).toLocaleDateString('en-GB')
                : new Date(selectedBillForPrint.created_at || selectedBillForPrint.updated_at).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className={styles.metaPillCol}>
            <span className={styles.metaLabel}>Source</span>
            <span className={styles.metaVal}>{selectedBillForPrint.order_number || 'S03978'}</span>
          </div>
          <div className={styles.metaPillCol}>
            <span className={styles.metaLabel}>Total Count</span>
            <span className={styles.metaVal}>
              {selectedBillForPrint.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}
            </span>
          </div>
          <div className={styles.metaPillCol}>
            <span className={styles.metaLabel}>Total Quantity</span>
            <span className={styles.metaVal}>
              {selectedBillForPrint.items.reduce((sum, item) => {
                const itemQty = item.calcType === 'unit' 
                  ? Number(item.quantity) 
                  : (Number(item.width || 0) * Number(item.height || 0) * Number(item.quantity || 1));
                return sum + itemQty;
              }, 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Client details Card */}
        <div className={styles.clientDetailsCard}>
          <div className={styles.clientDetailsHeader}>بيانات العميل المستلم</div>
          <div className={styles.clientDetailsBody}>
            <div><b>الاسم:</b> {selectedBillForPrint.client_name}</div>
            <div><b>رقم الهاتف:</b> {selectedBillForPrint.client_phone || '—'}</div>
            <div><b>العنوان بالتفصيل:</b> {selectedBillForPrint.client_address || 
              orders.find((o: any) => o.client_name === selectedBillForPrint.client_name || (o.client_phone && o.client_phone === selectedBillForPrint.client_phone))?.client_address ||
              appointments.find((a: any) => a.client_name === selectedBillForPrint.client_name || (a.client_phone && a.client_phone === selectedBillForPrint.client_phone))?.client_address ||
              '—'}</div>
            {selectedBillForPrint.notes && <div><b>ملاحظات إضافية:</b> {selectedBillForPrint.notes}</div>}
          </div>
        </div>

        {/* Items Table */}
        <table className={styles.premiumInvoiceTable}>
          <thead>
            <tr>
              <th>NOTE</th>
              <th>DESCRIPTION</th>
              <th>COLOR</th>
              <th>COUNT</th>
              <th>WIDTH</th>
              <th>HEIGHT</th>
              <th>QUANTITY</th>
              <th>UNIT PRICE</th>
              <th>DISC.%</th>
              <th>TAXES</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {selectedBillForPrint.items.map((item, idx) => {
              const qty = item.calcType === 'unit' 
                ? Number(item.quantity) 
                : (Number(item.width || 0) * Number(item.height || 0) * Number(item.quantity || 1));
              const discountPct = selectedBillForPrint.discount && selectedBillForPrint.total_items_price 
                ? Math.round((Number(selectedBillForPrint.discount) / Number(selectedBillForPrint.total_items_price)) * 100)
                : 0;

              return (
                <tr key={idx}>
                  <td>{selectedBillForPrint.notes || '—'}</td>
                  <td>{item.name}</td>
                  <td>L3-502</td>
                  <td>{item.quantity}</td>
                  <td>{item.calcType === 'unit' || item.calcType === 'linear_height' ? '—' : Number(item.width || 0).toFixed(2)}</td>
                  <td>{item.calcType === 'unit' || item.calcType === 'linear_width' ? '—' : Number(item.height || 0).toFixed(2)}</td>
                  <td>{qty.toFixed(2)} Units</td>
                  <td>{Number(item.price || 0).toFixed(2)}</td>
                  <td>{discountPct > 0 ? `${discountPct}%` : '0%'}</td>
                  <td>Untaxed</td>
                  <td>{Number(item.total || 0).toFixed(2)} LE</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Bottom Section (Summary + Terms) */}
        <div className={styles.premiumFooterLayout}>
          {/* Terms & Conditions (Left) */}
          <div className={styles.premiumTermsBox}>
            <div className={styles.paymentComm}>
              <b>Payment Communication:</b> {selectedBillForPrint.invoice_number}
            </div>
            
            <div className={styles.termsSection}>
              <span className={styles.termsSectionTitle}>الاحكام والشروط :</span>
              <ul className={styles.termsSectionList}>
                <li>جميع الاسعار بالجنيه المصرى وغير شامله ضريبه القيمه المضافه.</li>
                <li>شروط الدفع: 80% دفعه مقدمه 20% قبل التركيب.</li>
                <li>الستاره التى تقل مساحتها عن 2م مربع تحسب 2م مربع.</li>
                <li>مده التوريد والتركيب 7 ايام عمل من تاريخ امر التوريد.</li>
              </ul>
            </div>

            <div className={styles.termsSection}>
              <span className={styles.termsSectionTitle}>سياسه مابعد البيع والضمان :</span>
              <p className={styles.termsSectionText}>
                ان هدف كريستال للستائر الاساسى كشركه تعمل فى مجال الستائر بأنواعها المتعدده ارضاء عملائنا الكرام بتقديم افضل منتج مع التركيز على خدمه ما بعد البيع.
              </p>
            </div>

            <div className={styles.termsSection}>
              <span className={styles.termsSectionTitle}>الشروط العامة لخدمه ما بعد البيع :</span>
              <p className={styles.termsSectionText}>
                تقدم كريستال للستائر لعملائها الكرام شهاده ضمان ساريه لمده ثلاث سنوات من تاريخ التركيب ضد عيوب الصناعه تشمل الستاره ومحتواها. تتضمن خدمه مابعد البيع الاصلاح والصيانه مجانا وبدون اى رسوم.
              </p>
            </div>
          </div>

          {/* Totals table (Right) */}
          <div className={styles.premiumTotalsBox}>
            <table className={styles.premiumTotalsTable}>
              <tbody>
                <tr>
                  <td>Untaxed Amount</td>
                  <td>{Number(selectedBillForPrint.total_items_price || 0).toFixed(2)} LE</td>
                </tr>
                {Number(selectedBillForPrint.discount || 0) > 0 && (
                  <tr>
                    <td>Discount</td>
                    <td>{Number(selectedBillForPrint.discount || 0).toFixed(2)} LE</td>
                  </tr>
                )}
                {Number(selectedBillForPrint.installation_cost || 0) > 0 && (
                  <tr>
                    <td>Installation Cost</td>
                    <td>{Number(selectedBillForPrint.installation_cost || 0).toFixed(2)} LE</td>
                  </tr>
                )}
                {Number(selectedBillForPrint.transport_cost || 0) > 0 && (
                  <tr>
                    <td>Transport Cost</td>
                    <td>{Number(selectedBillForPrint.transport_cost || 0).toFixed(2)} LE</td>
                  </tr>
                )}
                <tr className={styles.premiumFinalRow}>
                  <td>Total</td>
                  <td>{Number(selectedBillForPrint.final_total || 0).toFixed(2)} LE</td>
                </tr>
                {Number(selectedBillForPrint.deposit || 0) > 0 && (
                  <tr>
                    <td>Deposit / المدفوع</td>
                    <td>{Number(selectedBillForPrint.deposit || 0).toFixed(2)} LE</td>
                  </tr>
                )}
                <tr className={styles.premiumRemainingRow}>
                  <td>Remaining / المتبقي</td>
                  <td>{Number(selectedBillForPrint.remaining_amount || 0).toFixed(2)} LE</td>
                </tr>
              </tbody>
            </table>

            <div className={styles.signatureBlockNew}>
              <div className={styles.signatureTitleNew}>توقيع العميل بالاستلام والاعتماد</div>
              <div className={styles.signatureLineNew}>____________________________________</div>
            </div>
          </div>
        </div>

        <div className={styles.thankYouNew}>
          شكراً لاختياركم معرض كريستال للستائر - نتمنى لكم تجربة تسوق مميزة
        </div>
      </div>
    )}
  </>
);
}
