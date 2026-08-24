'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, Appointment, AppointmentStatus, AppointmentType, Bill, BillItem, CalcType } from '@/lib/supabase';
import { WebsiteAsset } from '@/lib/images';
import { Product } from '@/lib/products';
import { Partner } from '@/lib/partners';
import { ContactMessage } from '@/lib/messages';
import { getDeliveryFees, updateDeliveryFeeInDb, resetAllDeliveryFeesInDb, type Governorate } from '@/lib/deliveryFees';
import { slugify } from '@/lib/slugs';
import styles from './admin.module.css';
import AdvancedDashboardView from './AdvancedDashboardView';
import ClientsView from './views/ClientsView';
import InspectionsView from './views/InspectionsView';
import InstallationsView from './views/InstallationsView';
import MaintenanceView from './views/MaintenanceView';
import ExpensesView from './views/ExpensesView';
import EmployeesView from './views/EmployeesView';
import ReportsView from './views/ReportsView';
import MotorProductsView from './views/MotorProductsView';
import ProductCategoriesView from './views/ProductCategoriesView';
import TestimonialsView from './views/TestimonialsView';
import CatalogsView from './views/CatalogsView';
import ProjectsView from './views/ProjectsView';
import { ProductCategory, getCategories } from '@/lib/products';
import { getBookingSettings, saveBookingSettings, formatTime12h, ALL_POSSIBLE_TIMES, DAYS_NAMES } from '@/lib/bookingSettings';


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
  maintenance: 'صيانة',
};
const TYPE_COLORS: Record<AppointmentType, string> = {
  inspection: styles.typeInspection,
  installation: styles.typeInstallation,
  maintenance: styles.typeInspection,
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
type FilterType = 'all' | AppointmentType;

const ROLE_TABS: Record<string, string[]> = {
  admin: ['dashboard', 'clients', 'orders', 'appointments', 'inspections', 'installations', 'maintenance', 'bills', 'products', 'product_categories', 'expenses', 'employees', 'messages', 'website_edit', 'users', 'motor_products', 'testimonials', 'catalogs', 'projects'],
  customer_service: ['dashboard', 'clients', 'orders', 'appointments', 'inspections', 'installations', 'maintenance', 'bills', 'messages'],
  sales: ['dashboard', 'clients', 'orders', 'appointments', 'inspections', 'installations', 'maintenance', 'bills', 'products', 'messages', 'motor_products'],
  accountant: ['dashboard', 'bills', 'expenses', 'orders', 'clients'],
  technician: ['inspections', 'installations', 'maintenance', 'appointments'],
  employee: ['clients', 'appointments', 'installations', 'maintenance', 'orders', 'bills', 'messages'],
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showFullMenu = !sidebarCollapsed || !isDesktop;
  const [saving, setSaving] = useState(false);

  // New states for active tab
  const [activeTab, setActiveTab] = useState<'appointments' | 'website_edit' | 'products' | 'product_categories' | 'orders' | 'bills' | 'messages' | 'users' | 'dashboard' | 'clients' | 'inspections' | 'installations' | 'maintenance' | 'expenses' | 'employees' | 'motor_products' | 'testimonials' | 'catalogs' | 'projects'>('dashboard');
  const [websiteAssets, setWebsiteAssets] = useState<WebsiteAsset[]>([]);
  const [dbCategories, setDbCategories] = useState<ProductCategory[]>([]);

  // Role & checking states
  const [userRole, setUserRole] = useState<'admin' | 'customer_service' | 'sales' | 'accountant' | 'technician' | 'employee' | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);
  const [roleChecking, setRoleChecking] = useState(true);

  // Users Management state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState({ name: '', role: 'employee', password: '' });
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);

  // Website Edit sub tab
  const [websiteEditSubTab, setWebsiteEditSubTab] = useState<'images' | 'partners' | 'delivery_fees'>('images');

  // Delivery Fees state
  const [deliveryFees, setDeliveryFees] = useState<Governorate[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);

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
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billFormSubmitted, setBillFormSubmitted] = useState(false);
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
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('all');
  const [ordersDateFilter, setOrdersDateFilter] = useState('');
  const [ordersDateRangePreset, setOrdersDateRangePreset] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [employees, setEmployees] = useState<any[]>([]);

  // Settings state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [bookingDays, setBookingDays] = useState<number[]>([0, 1, 2, 3, 4, 6]);
  const [bookingTimes, setBookingTimes] = useState<string[]>(['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']);

  useEffect(() => {
    if (showSettings) {
      const curr = getBookingSettings();
      setBookingDays(curr.availableDays);
      setBookingTimes(curr.availableTimes);
    }
  }, [showSettings]);

  const hasAccess = (tab: string) => {
    return ROLE_TABS[userRole || 'employee']?.includes(tab) || false;
  };
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
      } else if (role === 'employee') {
        setActiveTab('appointments');
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
    if (!error && data) {
      setWebsiteAssets(data as WebsiteAsset[]);
      
      const defaultAssets = [
        {
          key: 'page_header',
          url: '/hero_bg.png',
          description: 'صورة الهيدر والخرائط لجميع الصفحات الداخلية (Header Background)'
        },
        {
          key: 'somfy_hero_image',
          url: '',
          description: 'صورة قسم محركات Somfy الفرنسية'
        },
        {
          key: 'azzurra_hero_image',
          url: '',
          description: 'صورة قسم محركات Azzurra الإيطالية'
        }
      ];

      let needsRefresh = false;
      for (const def of defaultAssets) {
        if (!data.some((asset: any) => asset.key === def.key)) {
          await supabase.from('website_assets').insert(def);
          needsRefresh = true;
        }
      }

      if (needsRefresh) {
        const { data: updatedData } = await supabase.from('website_assets').select('*').order('key');
        if (updatedData) setWebsiteAssets(updatedData as WebsiteAsset[]);
      }
    }
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

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await supabase.from('employees').select('*');
      setEmployees(data || []);
    } catch {
      setEmployees([]);
    }
  }, []);

  const fetchDeliveryFees = useCallback(async () => {
    setLoadingFees(true);
    const data = await getDeliveryFees();
    setDeliveryFees(data);
    setLoadingFees(false);
  }, []);

  const handleSaveDeliveryFee = async (id: string, fee: number) => {
    setSaving(true);
    const success = await updateDeliveryFeeInDb(id, fee);
    setSaving(false);
    if (success) {
      alert('تم تحديث تكلفة التوصيل بنجاح');
      fetchDeliveryFees();
    } else {
      alert('فشل التحديث. الرجاء التأكد من تشغيل ملف الهجرة (migration) لجدول مصاريف الشحن.');
    }
  };

  const handleResetDeliveryFees = async () => {
    if (!confirm('هل تريد إعادة تعيين جميع مصاريف الشحن لأسعار المحافظات القياسية الافتراضية؟')) return;
    setSaving(true);
    const success = await resetAllDeliveryFeesInDb();
    setSaving(false);
    if (success) {
      alert('تمت إعادة تعيين جميع مصاريف الشحن لأسعار المحافظات القياسية بنجاح');
      fetchDeliveryFees();
    } else {
      alert('فشلت إعادة التعيين');
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setProducts(data.map((row: any) => ({
        id: row.id, slug: row.slug || undefined, images: row.images || [], alt: row.alt, labelEn: row.label_en, labelAr: row.label_ar,
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

  const fetchExpenses = useCallback(async () => {
    const { data } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
    if (data) setExpenses(data);
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
    setBillFormSubmitted(false);
    const nextNum = bills.length + 1;
    const invNum = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;
    setSelectedBill({
      invoice_number: invNum,
      client_name: '',
      client_phone: '',
      client_address: '',
      sales_rep: '',
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

  const getBillMissingFields = (bill: Partial<Bill> | null): string[] => {
    if (!bill) return ['لم يتم تحديد الفاتورة'];
    const missing: string[] = [];

    if (!bill.client_name || !bill.client_name.trim()) {
      missing.push('اسم العميل (Customer Name)');
    }
    if (!bill.client_phone || !bill.client_phone.trim()) {
      missing.push('رقم هاتف العميل (Phone)');
    }
    if (!bill.client_address || !bill.client_address.trim()) {
      missing.push('عنوان العميل (Address)');
    }
    if (!bill.invoice_number || !bill.invoice_number.trim()) {
      missing.push('رقم الفاتورة / عرض السعر (Quotation No.)');
    }

    if (!bill.items || bill.items.length === 0) {
      missing.push('إضافة بند واحد على الأقل في الفاتورة (Items)');
    } else {
      bill.items.forEach((item, idx) => {
        const itemNum = idx + 1;
        if (!item.name || !item.name.trim()) {
          missing.push(`اسم المنتج / الصنف في البند (#${itemNum})`);
        }
        if (item.calcType !== 'unit') {
          if (!item.width || Number(item.width) <= 0) {
            missing.push(`العرض بالمتر في البند (#${itemNum})`);
          }
          if (!item.height || Number(item.height) <= 0) {
            missing.push(`الارتفاع بالمتر في البند (#${itemNum})`);
          }
        }
        if (!item.quantity || Number(item.quantity) <= 0) {
          missing.push(`الكمية / العدد في البند (#${itemNum})`);
        }
        if (!item.price || Number(item.price) <= 0) {
          missing.push(`سعر المتر أو الوحدة في البند (#${itemNum})`);
        }
      });
    }

    return missing;
  };

  const handleSaveBill = async () => {
    setBillFormSubmitted(true);
    const missing = getBillMissingFields(selectedBill);
    if (missing.length > 0) {
      alert(`يرجى استكمال البيانات الناقصة التالية قبل حفظ الفاتورة:\n\n• ${missing.join('\n• ')}`);
      return;
    }

    setSaving(true);

    const items = selectedBill?.items || [];
    const cleanedItems = items.map(item => {
      const w = item.width === '' ? 0 : (Number(item.width) || 0);
      const h = item.height === '' ? 0 : (Number(item.height) || 0);
      const qty = item.quantity === '' ? 1 : (Number(item.quantity) || 1);
      const p = item.price === '' ? 0 : (Number(item.price) || 0);
      const mode = item.calcType || 'square_meter';

      let computedTotal = 0;
      if (mode === 'square_meter') {
        const pieceArea = (w > 0 && h > 0) ? Math.max(2, w * h) : (w * h);
        computedTotal = Math.round((pieceArea * qty * p) * 100) / 100;
      } else if (mode === 'linear_width') {
        computedTotal = Math.round((w * qty * p) * 100) / 100;
      } else if (mode === 'linear_height') {
        computedTotal = Math.round((h * qty * p) * 100) / 100;
      } else {
        computedTotal = Math.round((qty * p) * 100) / 100;
      }

      return {
        name: item.name || '',
        calcType: mode,
        width: w,
        height: h,
        quantity: qty,
        price: p,
        total: computedTotal
      };
    });

    const totalItemsPrice = cleanedItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const discount = Number(selectedBill?.discount) || 0;
    const installation = Number(selectedBill?.installation_cost) || 0;
    const transport = Number(selectedBill?.transport_cost) || 0;
    const deposit = Number(selectedBill?.deposit) || 0;

    const finalTotal = Math.max(0, Math.round((totalItemsPrice - discount + installation + transport) * 100) / 100);
    const remainingAmount = Math.max(0, Math.round((finalTotal - deposit) * 100) / 100);

    const payload = {
      invoice_number: selectedBill?.invoice_number,
      client_name: selectedBill?.client_name,
      client_phone: selectedBill?.client_phone || null,
      client_address: selectedBill?.client_address || null,
      order_number: selectedBill?.order_number || null,
      payment_method: selectedBill?.payment_method || 'نقدي',
      delivery_date: selectedBill?.delivery_date || null,
      items: cleanedItems,
      total_items_price: totalItemsPrice,
      discount: discount,
      installation_cost: installation,
      transport_cost: transport,
      deposit: deposit,
      remaining_amount: remainingAmount,
      final_total: finalTotal,
      sales_rep: selectedBill?.sales_rep || '',
      notes: selectedBill?.notes || null,
      updated_at: new Date().toISOString()
    };

    let error;
    if (selectedBill?.id) {
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
      alert('تم حفظ الفاتورة وعرض السعر بنجاح');
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

    const finalTotal = Math.max(0, Math.round((totalItemsPrice - discount + installation + transport) * 100) / 100);
    const remainingAmount = Math.max(0, Math.round((finalTotal - deposit) * 100) / 100);

    setSelectedBill({
      ...updatedBill,
      total_items_price: totalItemsPrice,
      deposit: deposit,
      remaining_amount: remainingAmount,
      final_total: finalTotal
    });
  };

  // Group orders strictly by Order Number / Order Code
  const groupedBillOrders = useMemo(() => {
    const map = new Map<string, {
      groupId: string;
      client_name: string;
      client_phone: string;
      client_address: string;
      items: BillItem[];
      ordersList: any[];
      total_price: number;
      total_pieces: number;
      order_number: string;
    }>();

    orders.forEach(o => {
      const match = o.client_address?.match(/كود الطلب:\s*(C-\d+)/) || o.client_address?.match(/Order Code:\s*(C-\d+)/);
      const codeKey = match ? match[1] : (o.order_number || `${(o.client_name || '').trim()}_${(o.client_phone || '').trim()}_${new Date(o.created_at).toISOString().substring(0, 16)}`);

      const itemQty = Number(o.pieces) || 1;
      const itemTotal = Number(o.total_price) || 0;
      const itemPrice = itemQty > 0 ? itemTotal / itemQty : itemTotal;

      const importedItem: BillItem = {
        name: `${o.products?.label_ar || 'ستارة'} (${o.width || 0} × ${o.height || 0} سم)`,
        calcType: 'unit',
        width: Number(o.width || 0) / 100,
        height: Number(o.height || 0) / 100,
        quantity: itemQty,
        price: itemPrice,
        total: itemTotal,
      };

      const displayOrderNum = match ? match[1] : (o.order_number || String(o.id).slice(0, 8).toUpperCase());

      if (!map.has(codeKey)) {
        map.set(codeKey, {
          groupId: `group_${codeKey}`,
          client_name: o.client_name || '',
          client_phone: o.client_phone || '',
          client_address: o.client_address || '',
          order_number: displayOrderNum,
          items: [importedItem],
          ordersList: [o],
          total_price: itemTotal,
          total_pieces: itemQty,
        });
      } else {
        const existing = map.get(codeKey)!;
        existing.items.push(importedItem);
        existing.ordersList.push(o);
        existing.total_price += itemTotal;
        existing.total_pieces += itemQty;
      }
    });

    return Array.from(map.values());
  }, [orders]);

  const handleImportOrder = (selectedValue: string) => {
    if (!selectedValue) {
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

    const group = groupedBillOrders.find(g => g.groupId === selectedValue);
    let client_name = '';
    let client_phone = '';
    let client_address = '';
    let order_number = '';
    let importedItems: BillItem[] = [];
    let totalItemsPrice = 0;

    if (group) {
      client_name = group.client_name;
      client_phone = group.client_phone;
      client_address = group.client_address;
      order_number = group.order_number;
      importedItems = group.items;
      totalItemsPrice = group.total_price;
    } else {
      const singleOrder = orders.find(o => String(o.id) === selectedValue);
      if (!singleOrder) return;
      client_name = singleOrder.client_name || '';
      client_phone = singleOrder.client_phone || '';
      client_address = singleOrder.client_address || '';
      order_number = String(singleOrder.id).slice(0, 8).toUpperCase();
      importedItems = [{
        name: `${singleOrder.products?.label_ar || 'ستارة'} (${singleOrder.width} × ${singleOrder.height} سم)`,
        calcType: 'unit',
        width: Number(singleOrder.width) / 100,
        height: Number(singleOrder.height) / 100,
        quantity: Number(singleOrder.pieces) || 1,
        price: Number(singleOrder.total_price) / (Number(singleOrder.pieces) || 1),
        total: Number(singleOrder.total_price)
      }];
      totalItemsPrice = Number(singleOrder.total_price);
    }

    setSelectedBill(prev => {
      if (!prev) return null;
      const discount = Number(prev.discount) || 0;
      const installation = Number(prev.installation_cost) || 0;
      const transport = Number(prev.transport_cost) || 0;
      const deposit = Number(prev.deposit) || 0;

      const finalTotal = Math.round((totalItemsPrice - discount + installation + transport) * 100) / 100;
      const remainingAmount = Math.round((finalTotal - deposit) * 100) / 100;

      return {
        ...prev,
        client_name,
        client_phone,
        client_address,
        order_number,
        items: importedItems,
        total_items_price: totalItemsPrice,
        deposit,
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
      const pieceArea = (w > 0 && h > 0) ? Math.max(2, w * h) : (w * h);
      item.total = Math.round((qty * pieceArea * p) * 100) / 100;
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

  const sanitizeBillDimension = (val: string): string => {
    if (!val) return '';
    let cleaned = String(val).replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    const [intPart, decPart] = cleaned.split('.');
    let trimmedInt = intPart.replace(/^0+(?=\d)/, '');
    if (trimmedInt.length > 2) {
      trimmedInt = trimmedInt.slice(0, 2);
    }
    if (decPart !== undefined) {
      return `${trimmedInt}.${decPart.slice(0, 2)}`;
    }
    return trimmedInt;
  };

  const sanitizeBillQuantity = (val: string): string => {
    if (!val) return '';
    let cleaned = String(val).replace(/\D/g, '');
    let trimmed = cleaned.replace(/^0+(?=\d)/, '');
    if (trimmed.length > 4) trimmed = trimmed.slice(0, 4);
    return trimmed;
  };

  const sanitizeBillPrice = (val: string): string => {
    if (!val) return '';
    let cleaned = String(val).replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    const [intPart, decPart] = cleaned.split('.');
    let trimmedInt = intPart.replace(/^0+(?=\d)/, '');
    if (trimmedInt.length > 6) trimmedInt = trimmedInt.slice(0, 6);
    if (decPart !== undefined) {
      return `${trimmedInt}.${decPart.slice(0, 2)}`;
    }
    return trimmedInt;
  };

  const updateBillItemField = (index: number, field: string, value: any) => {
    if (!selectedBill || !selectedBill.items) return;
    const newItems = [...selectedBill.items];
    let sanitizedValue = value;
    if (field === 'width' || field === 'height') {
      sanitizedValue = sanitizeBillDimension(String(value));
    } else if (field === 'quantity') {
      sanitizedValue = sanitizeBillQuantity(String(value));
    } else if (field === 'price') {
      sanitizedValue = sanitizeBillPrice(String(value));
    }

    const item = { ...newItems[index], [field]: sanitizedValue };

    if (['width', 'height', 'quantity', 'price', 'calcType'].includes(field)) {
      const qtyStr = item.quantity;
      const priceStr = item.price;

      if (qtyStr === '' || priceStr === '') {
        item.total = '';
      } else {
        const qty = Number(qtyStr) || 0;
        const w = Number(item.width) || 0;
        const h = Number(item.height) || 0;
        const p = Number(priceStr) || 0;
        const mode = item.calcType;

        if (mode === 'square_meter') {
          const pieceArea = (w > 0 && h > 0) ? Math.max(2, w * h) : (w * h);
          item.total = Math.round((qty * pieceArea * p) * 100) / 100;
        } else if (mode === 'linear_width') {
          item.total = Math.round((qty * w * p) * 100) / 100;
        } else if (mode === 'linear_height') {
          item.total = Math.round((qty * h * p) * 100) / 100;
        } else {
          item.total = Math.round((qty * p) * 100) / 100;
        }
      }
    } else if (field === 'total') {
      item.total = value === '' ? '' : (Number(value) || 0);
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
      height: '',
      width: '',
      quantity: '',
      price: '',
      calcType: 'square_meter',
      total: ''
    };
    setSelectedBill({
      ...selectedBill,
      items: [...(selectedBill.items || []), newItem]
    });
  };

  // Redirect users if they somehow land on unauthorized tabs
  useEffect(() => {
    if (userRole && !hasAccess(activeTab)) {
      if (userRole === 'technician') {
        setActiveTab('inspections');
      } else if (userRole === 'accountant') {
        setActiveTab('bills');
      } else {
        setActiveTab('appointments');
      }
    }
  }, [activeTab, userRole]);

  useEffect(() => {
    fetchUnreadCount();
    if (activeTab === 'dashboard') {
      fetchAppointments();
      fetchBills();
      fetchOrders();
      fetchProducts();
      fetchMessages();
      fetchExpenses();
      fetchEmployees();
      getCategories().then(setDbCategories);
    }
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'website_edit') {
      fetchWebsiteAssets();
      fetchPartners();
      fetchDeliveryFees();
      fetchProducts();
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
    if (activeTab === 'expenses') {
      fetchExpenses();
    }
  }, [fetchAppointments, fetchWebsiteAssets, fetchPartners, fetchDeliveryFees, fetchProducts, fetchOrders, fetchBills, fetchMessages, fetchUnreadCount, fetchUsers, fetchExpenses, activeTab]);



  const filtered = appointments.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterType !== 'all' && a.appointment_type !== filterType) return false;
    if (filterDate && a.appointment_date !== filterDate) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.client_name.toLowerCase().includes(q) || a.client_phone.includes(q) || a.client_address.toLowerCase().includes(q);
    }
    return true;
  });

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: any } = {};
    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    orders.forEach(o => {
      if (ordersSearch) {
        const q = ordersSearch.toLowerCase();
        const nameMatch = o.client_name?.toLowerCase().includes(q);
        const phoneMatch = o.client_phone?.includes(q);
        const prodArMatch = o.products?.label_ar?.toLowerCase().includes(q);
        const prodEnMatch = o.products?.label_en?.toLowerCase().includes(q);
        const codeMatch = String(o.id).toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !prodArMatch && !prodEnMatch && !codeMatch) return;
      }
      if (ordersStatusFilter !== 'all' && o.status !== ordersStatusFilter) return;

      if (ordersDateRangePreset === 'today') {
        const orderDateStr = new Date(o.created_at).toISOString().split('T')[0];
        if (orderDateStr !== todayStr) return;
      } else if (ordersDateRangePreset === 'week') {
        const orderTime = new Date(o.created_at).getTime();
        if (orderTime < sevenDaysAgo) return;
      } else if (ordersDateRangePreset === 'month') {
        const orderTime = new Date(o.created_at).getTime();
        if (orderTime < thirtyDaysAgo) return;
      } else if (ordersDateRangePreset === 'custom' && ordersDateFilter) {
        const orderDateStr = new Date(o.created_at).toISOString().split('T')[0];
        if (orderDateStr !== ordersDateFilter) return;
      }

      const match = o.client_address?.match(/كود الطلب:\s*(C-\d+)/) || o.client_address?.match(/Order Code:\s*(C-\d+)/);
      const groupId = match ? match[1] : `${o.client_phone}-${new Date(o.created_at).toISOString().substring(0, 16)}`;

      if (!groups[groupId]) {
        groups[groupId] = {
          ...o,
          id: match ? match[1] : String(o.id),
          actual_ids: [o.id],
          total_price: Number(o.total_price),
          items: [o]
        };
      } else {
        groups[groupId].actual_ids.push(o.id);
        groups[groupId].total_price += Number(o.total_price);
        groups[groupId].items.push(o);
      }
    });
    return Object.values(groups).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, ordersSearch, ordersStatusFilter, ordersDateFilter, ordersDateRangePreset]);

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

  const updateOrderStatus = async (id: string | string[], status: string) => {
    setSaving(true);
    const idsArray = Array.isArray(id) ? id : [id];
    const { error } = await supabase.from('orders').update({ status }).in('id', idsArray);
    if (!error) {
      setOrders(prev => prev.map(o => idsArray.includes(o.id) ? { ...o, status } : o));
      if (selectedOrder && (selectedOrder.actual_ids ? selectedOrder.actual_ids.includes(selectedOrder.id) : idsArray.includes(selectedOrder.id))) {
        setSelectedOrder((prev: any) => prev ? { ...prev, status } : null);
      }
    }
    setSaving(false);
  };

  const handleCancelOrder = async (id: string | string[]) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
    await updateOrderStatus(id, 'cancelled');
    alert('تم إلغاء الطلب بنجاح');
  };

  const handleDeleteOrder = async (id: string | string[]) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟ لا يمكن التراجع عن هذه الخطوة.')) return;
    setSaving(true);
    const idsArray = Array.isArray(id) ? id : [id];
    const { error } = await supabase.from('orders').delete().in('id', idsArray);
    if (!error) {
      setOrders(prev => prev.filter(o => !idsArray.includes(o.id)));
      if (selectedOrder) {
        setShowOrderModal(false);
        setSelectedOrder(null);
      }
      alert('تم حذف الطلب بنجاح');
    } else {
      alert('حدث خطأ أثناء حذف الطلب: ' + error.message);
    }
    setSaving(false);
  };

  const updateOrderPaymentStatus = async (id: string | string[], paymentStatus: string) => {
    setSaving(true);
    const idsArray = Array.isArray(id) ? id : [id];
    const { error } = await supabase.from('orders').update({ payment_status: paymentStatus }).in('id', idsArray);
    if (!error) {
      setOrders(prev => prev.map(o => idsArray.includes(o.id) ? { ...o, payment_status: paymentStatus } : o));
      if (selectedOrder && (selectedOrder.actual_ids ? selectedOrder.actual_ids.includes(selectedOrder.id) : idsArray.includes(selectedOrder.id))) {
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

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editUserData.name,
          role: editUserData.role,
          password: editUserData.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تحديث بيانات المستخدم');
      }

      if (data.warning) {
        alert(data.warning);
      } else {
        alert('تم تحديث البيانات وكلمة المرور بنجاح');
      }

      setShowEditUserModal(false);
      setEditingUser(null);
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
    if (newEmail.trim()) updates.email = newEmail.trim();
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
    const computedSlug = selectedProduct.slug ? slugify(selectedProduct.slug) : slugify(selectedProduct.labelEn || selectedProduct.labelAr);
    const payload = {
      alt: selectedProduct.alt || selectedProduct.labelEn,
      slug: computedSlug || null,
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
  const today = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.appointment_date === today).length;

  const sidebarLinks = [
    { tab: 'dashboard', label: 'لوحة التحكم', icon: 'dashboard', access: 'dashboard' },
    { tab: 'clients', label: 'العملاء', icon: 'group', access: 'clients' },
    { tab: 'appointments', label: 'المواعيد', icon: 'calendar_today', access: 'appointments' },
    { tab: 'inspections', label: 'أوامر المعاينة', icon: 'assignment', access: 'inspections' },
    { tab: 'installations', label: 'أوامر التركيب', icon: 'handyman', access: 'installations' },
    { tab: 'maintenance', label: 'أوامر الصيانة', icon: 'build', access: 'maintenance' },
    { tab: 'orders', label: 'الطلبات', icon: 'shopping_cart', access: 'orders' },
    { tab: 'bills', label: 'الفواتير', icon: 'description', access: 'bills' },
    { tab: 'products', label: 'المنتجات', icon: 'inventory', access: 'products' },
    { tab: 'product_categories', label: 'أقسام المنتجات', icon: 'category', access: 'product_categories' },
    { tab: 'expenses', label: 'المصروفات', icon: 'payments', access: 'expenses' },
    { tab: 'employees', label: 'الموظفون', icon: 'badge', access: 'employees' },
    { tab: 'messages', label: 'رسائل التواصل', icon: 'mail', access: 'messages', showUnread: true },
    { tab: 'website_edit', label: 'تعديل الموقع', icon: 'edit_document', access: 'website_edit' },
    { tab: 'motor_products', label: 'منتجات المحركات', icon: 'precision_manufacturing', access: 'motor_products' },
    { tab: 'testimonials', label: 'آراء العملاء', icon: 'rate_review', access: 'testimonials' },
    { tab: 'catalogs', label: 'الكتالوجات', icon: 'menu_book', access: 'catalogs' },
    { tab: 'projects', label: 'معرض مشاريعنا', icon: 'photo_library', access: 'projects' },
    { tab: 'users', label: 'إدارة المستخدمين', icon: 'group', access: 'users' },
  ];

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
        <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} !bg-[#2B1B17] !border-l border-white/5 !text-white/70 shadow-xl transition-all duration-300`}>
          <button className={styles.mobileClose} onClick={() => setMobileMenuOpen(false)}>✕</button>
          {isDesktop && (
            <div className={`flex w-full ${showFullMenu ? 'justify-start px-4' : 'justify-center'} pt-2`}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-white/50 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-200"
                title={sidebarCollapsed ? "فتح القائمة" : "إغلاق القائمة"}
              >
                <span className="material-symbols-outlined text-lg leading-none">
                  {sidebarCollapsed ? "chevron_left" : "chevron_right"}
                </span>
              </button>
            </div>
          )}
          <nav className="flex flex-col gap-1 flex-1 w-full overflow-y-auto hide-scrollbar pt-4">
            {sidebarLinks.map(link => {
              if (!hasAccess(link.access)) return null;
              const isActive = activeTab === link.tab;
              return (
                <div
                  key={link.tab}
                  className={`flex items-center ${showFullMenu ? 'gap-3 px-4 justify-start' : 'justify-center'} py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${isActive
                    ? 'bg-[#d4af37]/15 !text-[#d4af37] shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  onClick={() => { setActiveTab(link.tab as any); setMobileMenuOpen(false); }}
                  title={!showFullMenu ? link.label : undefined}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">{link.icon}</span>
                    {link.showUnread && unreadCount > 0 && !showFullMenu && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#b91c1c] text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center animate-pulse" />
                    )}
                  </div>
                  {showFullMenu && <span>{link.label}</span>}
                  {link.showUnread && unreadCount > 0 && showFullMenu && (
                    <span className="bg-[#b91c1c] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center mr-auto">{unreadCount}</span>
                  )}
                </div>
              );
            })}

            <div
              className={`flex items-center ${showFullMenu ? 'gap-3 px-4 justify-start' : 'justify-center'} py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 text-white/60 hover:text-white hover:bg-white/5`}
              onClick={() => { setShowSettings(true); setMobileMenuOpen(false); }}
              title={!showFullMenu ? "الإعدادات" : undefined}
            >
              <span className="material-symbols-outlined text-base">settings</span>
              {showFullMenu && <span>الإعدادات</span>}
            </div>

            <div
              className={`flex items-center ${showFullMenu ? 'gap-3 px-4 justify-start' : 'justify-center'} py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 text-white/60 hover:text-white hover:bg-white/5`}
              onClick={handleSignOut}
              title={!showFullMenu ? "تسجيل الخروج" : undefined}
            >
              <span className="material-symbols-outlined text-base">logout</span>
              {showFullMenu && <span>تسجيل الخروج</span>}
            </div>
          </nav>
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

          {activeTab === 'dashboard' && hasAccess('dashboard') ? (
            <AdvancedDashboardView
              appointments={appointments}
              orders={orders}
              bills={bills}
              expenses={expenses}
              products={products}
              messages={messages}
              employees={employees}
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
              handleSignOut={handleSignOut}
            />
          ) : activeTab === 'testimonials' ? (
            <TestimonialsView />
          ) : activeTab === 'catalogs' ? (
            <CatalogsView />
          ) : activeTab === 'projects' ? (
            <ProjectsView />
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
                  { label: 'الكل', value: counts.all, color: '#d4af37' },
                  { label: 'قيد الانتظار', value: counts.pending, color: '#b45309' },
                  { label: 'مؤكدة', value: counts.confirmed, color: '#1d4ed8' },
                  { label: 'مكتملة', value: counts.completed, color: '#065f46' },
                  { label: 'ملغية', value: counts.cancelled, color: '#b91c1c' },
                  { label: 'معاينات', value: counts.inspection, color: '#6d28d9' },
                  { label: 'تركيب', value: counts.installation, color: '#0369a1' },
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
                <button
                  className={styles.refreshBtn}
                  style={{ background: '#3E2723', borderColor: '#3E2723', color: '#fff' }}
                  onClick={() => setShowSettings(true)}
                >
                  ⚙️ الأيام والساعات المتاحة
                </button>
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
                <button
                  type="button"
                  className={`${styles.subTab} ${websiteEditSubTab === 'delivery_fees' ? styles.subTabActive : ''}`}
                  onClick={() => setWebsiteEditSubTab('delivery_fees')}
                >
                  إدارة مصاريف الشحن
                </button>
              </div>

              {websiteEditSubTab === 'images' ? (
                loadingAssets ? (
                  <div className={styles.loadingBox}><span className={styles.spinner} />جاري تحميل الصور...</div>
                ) : (
                  <div className={styles.assetsGrid}>
                    {websiteAssets.filter(asset => asset.key !== 'homepage_curtains').map(asset => (
                      <div key={asset.key} className={styles.assetCard}>
                        <div className={styles.assetImageWrapper}>
                          {asset.url ? (
                            <img src={asset.url} alt={asset.description || asset.key} className={styles.assetImage} />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: '8px', padding: '20px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#d4af37' }}>add_photo_alternate</span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>لا توجد صورة محددة</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.assetInfo}>
                          <h3 className={styles.assetTitle}>{asset.description || asset.key}</h3>
                          <p className={styles.assetKey}>{asset.key}</p>

                          <div className={styles.assetActions} style={{ display: 'flex', gap: '8px' }}>
                            <label className={`${styles.uploadBtn} ${uploadingAsset === asset.key ? styles.uploadingBtn : ''}`} style={{ flex: 1 }}>
                              {uploadingAsset === asset.key ? 'جاري الرفع...' : asset.url ? 'تغيير الصورة' : '+ رفع صورة'}
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
                            {asset.url && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm('هل تريد مسح هذه الصورة وجعلها فارغة؟')) {
                                    await supabase.from('website_assets').upsert({ key: asset.key, url: '', updated_at: new Date().toISOString() }, { onConflict: 'key' });
                                    fetchWebsiteAssets();
                                  }
                                }}
                                style={{
                                  padding: '8px 12px',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                }}
                                title="مسح الصورة"
                              >
                                مسح
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {websiteAssets.length === 0 && (
                      <div className={styles.emptyBox}>لم يتم إضافة صور قابلة للتعديل بعد. استخدم ملف الإعدادات لإضافة المفاتيح.</div>
                    )}
                  </div>
                )
              ) : websiteEditSubTab === 'partners' ? (
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
              ) : websiteEditSubTab === 'delivery_fees' ? (
                loadingFees ? (
                  <div className={styles.loadingBox}><span className={styles.spinner} />جاري تحميل مصاريف الشحن...</div>
                ) : (
                  <>
                    <div className={styles.filtersRow} style={{ justifyContent: 'space-between', width: '100%', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                      <div className="flex items-center gap-3">
                        <strong style={{ color: '#3E2723' }}>مصاريف شحن المحافظات ({deliveryFees.length})</strong>
                        <span className="text-xs text-gray-500">انقر فوق حقل السعر لتغييره، ثم انقر على "حفظ" لتحديثه فوراً بقاعدة البيانات</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetDeliveryFees}
                        className={styles.addBtn}
                        style={{ background: '#f59e0b', fontSize: '0.8rem', padding: '6px 14px' }}
                        disabled={saving}
                      >
                        ⚡ إعادة ضبط الأسعار القياسية لجميع المحافظات
                      </button>
                    </div>
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>المحافظة (عربي)</th>
                            <th>المحافظة (إنجليزي)</th>
                            <th>تكلفة الشحن (ج.م)</th>
                            <th>إجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deliveryFees.map(gov => (
                            <tr key={gov.id} className={styles.tableRow} onClick={e => e.stopPropagation()}>
                              <td>{gov.nameAr}</td>
                              <td dir="ltr" style={{ textAlign: 'right' }}>{gov.nameEn}</td>
                              <td>
                                <input
                                  type="number"
                                  value={gov.fee}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setDeliveryFees(prev => prev.map(item => item.id === gov.id ? { ...item, fee: val } : item));
                                  }}
                                  className={styles.formInput}
                                  style={{ width: '120px', padding: '6px 12px', margin: 0, border: '1px solid rgba(62,39,35,0.15)' }}
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleSaveDeliveryFee(gov.id, gov.fee)}
                                  className={styles.addBtn}
                                  style={{ padding: '6px 12px', margin: 0 }}
                                  disabled={saving}
                                >
                                  حفظ
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )
              ) : null}
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


              {loadingProducts ? (
                <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>الصورة</th>
                        <th>اسم المنتج</th>
                        <th>الرمز في الرابط (Slug)</th>
                        <th>القسم</th>
                        <th>السعر</th>
                        <th>الحالة</th>
                        <th>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} className={styles.tableRow}>
                          <td>{p.images && p.images[0] && <img src={p.images[0]} alt="img" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />}</td>
                          <td>
                            <div style={{ fontWeight: 'bold', color: '#3E2723' }}>{p.labelAr}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }} dir="ltr">{p.labelEn}</div>
                          </td>
                          <td dir="ltr" style={{ textAlign: 'right' }}>
                            <code style={{ fontSize: '11px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#3E2723' }}>
                              {p.slug || slugify(p.labelEn || p.labelAr || p.id)}
                            </code>
                          </td>
                          <td>
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                              {p.category}
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold', color: '#15803d' }}>{p.price.toLocaleString('ar-EG')} ج.م</td>
                          <td>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              background: p.is_active !== false ? '#dcfce7' : '#fee2e2',
                              color: p.is_active !== false ? '#166534' : '#991b1b'
                            }}>
                              {p.is_active !== false ? 'نشط' : 'معطل'}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => { setSelectedProduct(p); setShowProductModal(true); }} className={styles.refreshBtn} style={{ marginRight: 8, padding: '4px 10px', fontWeight: 'bold' }}>تعديل</button>
                            <button onClick={() => handleDeleteProduct(p.id)} className={styles.deleteBtn} style={{ padding: '4px 10px' }}>حذف</button>
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

              <div className={styles.filtersRow} style={{ flexWrap: 'wrap', gap: '10px' }}>
                <input
                  className={styles.searchInput}
                  placeholder="بحث باسم العميل، الهاتف، أو نوع الستارة..."
                  value={ordersSearch}
                  onChange={e => setOrdersSearch(e.target.value)}
                  style={{ flex: 2, minWidth: '220px' }}
                />
                <select
                  className={styles.searchInput}
                  value={ordersDateRangePreset}
                  onChange={e => setOrdersDateRangePreset(e.target.value as any)}
                  style={{ flex: 1, minWidth: '160px', padding: '8px 12px' }}
                >
                  <option value="all">📅 كل الأوقات (الكل)</option>
                  <option value="today">📅 طلبات اليوم (Today)</option>
                  <option value="week">📅 طلبات هذا الأسبوع (This Week)</option>
                  <option value="month">📅 طلبات هذا الشهر (This Month)</option>
                  <option value="custom">📆 يوم محدد (Specific Date)</option>
                </select>

                {ordersDateRangePreset === 'custom' && (
                  <input
                    type="date"
                    className={styles.searchInput}
                    value={ordersDateFilter}
                    onChange={e => setOrdersDateFilter(e.target.value)}
                    style={{ flex: 1, minWidth: '140px' }}
                  />
                )}

                <select
                  className={styles.searchInput}
                  value={ordersStatusFilter}
                  onChange={e => setOrdersStatusFilter(e.target.value)}
                  style={{ flex: 1, minWidth: '140px', padding: '8px 12px' }}
                >
                  <option value="all">كل الحالات</option>
                  <option value="pending">🟡 قيد الانتظار</option>
                  <option value="shipped">🔵 جاري التوصيل</option>
                  <option value="delivered">🟢 تم التوصيل</option>
                  <option value="cancelled">🔴 ملغي</option>
                </select>
              </div>

              {loadingOrders ? (
                <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>رقم الطلب</th><th>العميل</th><th>المنتج</th><th>المقاس</th><th>الإجمالي</th><th>تاريخ الطلب</th><th>الحالة</th><th>تفاصيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedOrders.map(o => (
                        <tr key={o.id} className={styles.tableRow} onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }}>
                          <td dir="ltr" style={{ fontSize: '12px' }}>{String(o.id).split('-')[0]}</td>
                          <td>{o.client_name}<br /><span style={{ fontSize: '12px', color: '#666' }} dir="ltr">{o.client_phone}</span></td>
                          <td>{o.items && o.items.length > 1 ? `${o.items.length} منتجات` : o.products?.label_ar || 'منتج محذوف'}</td>
                          <td dir="ltr">{o.items && o.items.length > 1 ? 'متعدد' : `${o.width}x${o.height} cm`}</td>
                          <td>{o.total_price} ج.م</td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                              {new Date(o.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                            </div>
                            <div style={{ fontSize: '10px', color: '#666' }}>
                              {new Date(o.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <select
                              value={o.status}
                              onChange={e => updateOrderStatus(o.actual_ids || o.id, e.target.value)}
                              disabled={saving}
                              className={styles.inlineSelect}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                border: '1px solid rgba(62,39,35,0.15)',
                                cursor: 'pointer',
                                backgroundColor: o.status === 'delivered' ? '#dcfce7' : o.status === 'shipped' ? '#e0f2fe' : o.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                                color: o.status === 'delivered' ? '#15803d' : o.status === 'shipped' ? '#0369a1' : o.status === 'cancelled' ? '#b91c1c' : '#b45309'
                              }}
                            >
                              <option value="pending">🟡 قيد الانتظار</option>
                              <option value="shipped">🔵 جاري التوصيل</option>
                              <option value="delivered">🟢 تم التوصيل</option>
                              <option value="cancelled">🔴 ملغي</option>
                            </select>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                              <button className={styles.refreshBtn} style={{ padding: '4px 8px' }} onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }}>عرض</button>
                              {o.status !== 'cancelled' && (
                                <button
                                  className={styles.deleteBtn}
                                  style={{ padding: '4px 8px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                                  onClick={() => handleCancelOrder(o.actual_ids || o.id)}
                                >
                                  إلغاء
                                </button>
                              )}
                              <button
                                className={styles.deleteBtn}
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleDeleteOrder(o.actual_ids || o.id)}
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {groupedOrders.length === 0 && (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>لا توجد طلبات تطابق معايير البحث.</td></tr>
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
                        <th>القطع / البنود</th>
                        <th>العربون المدفوع</th>
                        <th>المتبقي للدفع</th>
                        <th>الإجمالي النهائي</th>
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
                        <tr key={b.id} className={styles.tableRow} onClick={() => { setSelectedBill(b); setBillFormSubmitted(false); setShowBillModal(true); }}>
                          <td dir="ltr" style={{ fontWeight: 'bold', color: '#3E2723' }}>
                            {b.invoice_number.startsWith('Q-') ? b.invoice_number : `Q-${b.invoice_number.replace(/^#/, '')}`}
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{b.client_name}</td>
                          <td dir="ltr">{b.client_phone || '—'}</td>
                          <td>{new Date(b.created_at || b.updated_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {(b.items || []).length} بند
                            </span>
                          </td>
                          <td style={{ color: '#15803d', fontWeight: 'bold' }}>{Number(b.deposit || 0).toLocaleString('ar-EG')} ج.م</td>
                          <td style={{ color: Number(b.remaining_amount || 0) > 0 ? '#d97706' : '#6b7280', fontWeight: 'bold' }}>
                            {Number(b.remaining_amount || 0).toLocaleString('ar-EG')} ج.م
                          </td>
                          <td style={{ color: '#3E2723', fontWeight: '900', fontSize: '0.95rem' }}>
                            {Number(b.final_total || 0).toLocaleString('ar-EG')} ج.م
                          </td>
                          <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handlePrint(b)} className={styles.refreshBtn} style={{ padding: '4px 10px', margin: 0, fontWeight: 'bold' }}>طباعة</button>
                            <button onClick={() => handleDeleteBill(b.id)} className={styles.deleteBtn} style={{ padding: '4px 10px', margin: 0 }}>حذف</button>
                          </td>
                        </tr>
                      ))}
                      {bills.length === 0 && (
                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>لا توجد فواتير بعد.</td></tr>
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
                          onClick={() => { setSelectedMessage(msg); setShowMessageModal(true); if (!msg.is_read) markMessageAsRead(msg.id, true); }}
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
                              onClick={() => { setSelectedMessage(msg); setShowMessageModal(true); if (!msg.is_read) markMessageAsRead(msg.id, true); }}
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
                          <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(u);
                                setEditUserData({ name: u.name || '', role: u.role || 'employee', password: '' });
                                setShowEditUserModal(true);
                              }}
                              className={styles.refreshBtn}
                              style={{ padding: '4px 8px', margin: 0 }}
                            >
                              تعديل
                            </button>
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
          ) : activeTab === 'product_categories' ? (
            <ProductCategoriesView />
          ) : activeTab === 'motor_products' ? (
            <MotorProductsView userRole={userRole} />
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
                    <input
                      className={styles.formInput}
                      value={selectedProduct.labelAr || ''}
                      onChange={e => {
                        const newAr = e.target.value;
                        setSelectedProduct(prev => {
                          if (!prev) return null;
                          const currentAuto = slugify(prev.labelEn || prev.labelAr || '');
                          const isAuto = !prev.slug || prev.slug === currentAuto;
                          return {
                            ...prev,
                            labelAr: newAr,
                            slug: isAuto ? slugify(prev.labelEn || newAr) : prev.slug
                          };
                        });
                      }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>الاسم (إنجليزي) *</label>
                    <input
                      className={styles.formInput}
                      dir="ltr"
                      value={selectedProduct.labelEn || ''}
                      onChange={e => {
                        const newEn = e.target.value;
                        setSelectedProduct(prev => {
                          if (!prev) return null;
                          const currentAuto = slugify(prev.labelEn || prev.labelAr || '');
                          const isAuto = !prev.slug || prev.slug === currentAuto;
                          return {
                            ...prev,
                            labelEn: newEn,
                            slug: isAuto ? slugify(newEn || prev.labelAr || '') : prev.slug
                          };
                        });
                      }}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.formFull}`}>
                    <label className={styles.formLabel}>
                      الرمز في الرابط (Slug) — يتم توليده تلقائياً ويمكن تخصيصه
                    </label>
                    <input
                      className={styles.formInput}
                      dir="ltr"
                      value={selectedProduct.slug || ''}
                      onChange={e => setSelectedProduct(prev => prev ? { ...prev, slug: slugify(e.target.value) } : null)}
                      placeholder="مثال: zebra-blinds-z11648"
                      style={{ fontFamily: 'monospace' }}
                    />
                    <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', direction: 'ltr', textAlign: 'left', display: 'block' }}>
                      Product URL: <code>/products/{selectedProduct.slug || slugify(selectedProduct.labelEn || selectedProduct.labelAr || 'product-slug')}</code>
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>القسم</label>
                    <select
                      className={styles.formInput}
                      dir="ltr"
                      value={selectedProduct.category || ''}
                      onChange={e => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                    >
                      <option value="">اختر القسم...</option>
                      {dbCategories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.slug} / {cat.nameAr}</option>
                      ))}
                    </select>
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
                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '11px', color: '#6b7280', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3E2723', display: 'inline-block' }} />
                        الصورة الرئيسية (Main Image)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#d4af37', display: 'inline-block' }} />
                        الصورة الفرعية (Sub Main / عند مرور الماوس)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6b7280', display: 'inline-block' }} />
                        صور إضافية (تظهر في صفحة التفاصيل)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {selectedProduct.images?.map((img, i) => (
                        <div key={i} style={{
                          position: 'relative', width: '105px', height: '125px',
                          border: i === 0 ? '2.5px solid #3E2723' : i === 1 ? '2.5px solid #d4af37' : '1.5px solid #e5e7eb',
                          borderRadius: '8px', overflow: 'hidden', background: '#f9fafb',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                          <img src={img} style={{ width: '100%', height: '80px', objectFit: 'cover' }} alt="prod" />
                          {/* Label badge */}
                          <div style={{
                            background: i === 0 ? '#3E2723' : i === 1 ? '#d4af37' : '#6b7280',
                            color: 'white', fontSize: '9px', textAlign: 'center',
                            padding: '3px 4px', fontWeight: 'bold',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>
                            {i === 0 ? '📷 الرئيسية' : i === 1 ? '🖼️ الفرعية' : `📎 إضافية ${i - 1}`}
                          </div>
                          {/* Action buttons row */}
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '3px 4px', background: '#ffffff' }}>
                            {/* Move right (towards main / lower index) */}
                            {i > 0 && (
                              <button
                                type="button"
                                title={i === 1 ? 'اجعلها الصورة الرئيسية' : 'تقديم جهة الرئيسية'}
                                onClick={() => {
                                  const newImages = [...(selectedProduct.images || [])];
                                  [newImages[i - 1], newImages[i]] = [newImages[i], newImages[i - 1]];
                                  setSelectedProduct({ ...selectedProduct, images: newImages });
                                }}
                                style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3E2723', fontWeight: 'bold' }}
                              >➡</button>
                            )}
                            {/* Move left (towards extras / higher index) */}
                            {i < (selectedProduct.images?.length || 0) - 1 && (
                              <button
                                type="button"
                                title="تأخير جهة الصور الإضافية"
                                onClick={() => {
                                  const newImages = [...(selectedProduct.images || [])];
                                  [newImages[i], newImages[i + 1]] = [newImages[i + 1], newImages[i]];
                                  setSelectedProduct({ ...selectedProduct, images: newImages });
                                }}
                                style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3E2723', fontWeight: 'bold' }}
                              >⬅</button>
                            )}
                            {/* Delete */}
                            <button
                              type="button"
                              title="حذف الصورة"
                              onClick={() => setSelectedProduct({ ...selectedProduct, images: selectedProduct.images!.filter((_, index) => index !== i) })}
                              style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 'bold' }}
                            >✕</button>
                          </div>
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
                  <div className={styles.detailItem}><span className={styles.detailLabel}>اسم العميل</span><span>{selectedOrder.client_name}</span></div>
                  <div className={styles.detailItem}><span className={styles.detailLabel}>الهاتف</span><span dir="ltr">{selectedOrder.client_phone}</span></div>
                  <div className={`${styles.detailItem} ${styles.detailFull}`}><span className={styles.detailLabel}>العنوان</span><span>{selectedOrder.client_address}</span></div>

                  <div className={`${styles.detailItem} ${styles.detailFull}`}>
                    <span className={styles.detailLabel}>المنتجات</span>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(selectedOrder.items || [selectedOrder]).map((item: any, idx: number) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.products?.label_ar || 'غير متاح'}</div>
                          <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#4b5563' }}>
                            <span dir="ltr">{item.width} × {item.height} سم</span>
                            <span>القطع: {item.pieces}</span>
                            <span>السعر: {item.total_price} ج.م</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.detailItem}><span className={styles.detailLabel}>الإجمالي</span><span style={{ color: '#b45309', fontWeight: 'bold' }}>{selectedOrder.total_price} ج.م</span></div>
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
                      onChange={e => updateOrderStatus(selectedOrder.actual_ids || selectedOrder.id, e.target.value)} disabled={saving}>
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
                        <span className={`${styles.badge} ${selectedOrder.payment_status === 'success' ? styles.statusCompleted :
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
                {/* Cancel and Delete Order actions */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', marginRight: selectedOrder.payment_method === 'wallet_instapay' ? '8px' : 'auto' }}>
                  {selectedOrder.status !== 'cancelled' && (
                    <button
                      className={styles.rejectPayBtn}
                      style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                      onClick={() => handleCancelOrder(selectedOrder.actual_ids || selectedOrder.id)}
                    >
                      إلغاء الطلب
                    </button>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteOrder(selectedOrder.actual_ids || selectedOrder.id)}
                  >
                    حذف الطلب
                  </button>
                </div>
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
                      <option value="">-- اختر الطلب برقم الطلب لاستيراد الفاتورة --</option>
                      {groupedBillOrders.map(g => (
                        <option key={g.groupId} value={g.groupId}>
                          طلب رقم: {g.order_number} - العميل: {g.client_name} ({g.items.length} قطع) - الإجمالي: {g.total_price.toLocaleString('ar-EG')} ج.م
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>رقم الفاتورة *</label>
                    <input
                      className={`${styles.formInput} ${billFormSubmitted && !selectedBill.invoice_number ? styles.inputError : ''}`}
                      value={selectedBill.invoice_number || ''}
                      onChange={e => updateBillField('invoice_number', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>اسم العميل *</label>
                    <input
                      className={`${styles.formInput} ${billFormSubmitted && !selectedBill.client_name ? styles.inputError : ''}`}
                      value={selectedBill.client_name || ''}
                      onChange={e => updateBillField('client_name', e.target.value)}
                      placeholder="أدخل اسم العميل بالكامل"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>رقم الهاتف *</label>
                    <input
                      className={`${styles.formInput} ${billFormSubmitted && !selectedBill.client_phone ? styles.inputError : ''}`}
                      dir="ltr"
                      value={selectedBill.client_phone || ''}
                      onChange={e => updateBillField('client_phone', e.target.value)}
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>العنوان بالتفصيل *</label>
                    <input
                      className={`${styles.formInput} ${billFormSubmitted && !selectedBill.client_address ? styles.inputError : ''}`}
                      value={selectedBill.client_address || ''}
                      onChange={e => updateBillField('client_address', e.target.value)}
                      placeholder="المدينة، الحي، الشارع، رقم العمارة/الشقة"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>رقم الطلب / الموعد</label>
                    <input className={styles.formInput} value={selectedBill.order_number || ''} onChange={e => updateBillField('order_number', e.target.value)} placeholder="اختياري" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>شروط / طريقة الدفع</label>
                    <select className={styles.formInput} value={selectedBill.payment_method || 'نقدي'} onChange={e => updateBillField('payment_method', e.target.value)}>
                      <option value="نقدي">نقدي (Cash)</option>
                      <option value="فيزا">فيزا (Visa/Card)</option>
                      <option value="تحويل بنكي">تحويل بنكي (Bank Transfer)</option>
                      <option value="فودافون كاش">فودافون كاش (Vodafone Cash)</option>
                      <option value="شيك">شيك (Cheque)</option>
                      <option value="As Agreed">حسب الاتفاق (As Agreed)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>موعد التسليم المتوقع</label>
                    <input className={styles.formInput} type="date" value={selectedBill.delivery_date || ''} onChange={e => updateBillField('delivery_date', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>مسؤول المبيعات (Sales Rep) *</label>
                    <input
                      className={styles.formInput}
                      value={selectedBill.sales_rep || ''}
                      onChange={e => updateBillField('sales_rep', e.target.value)}
                      placeholder="مثال: هناء عبدالله"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>ملاحظات الفاتورة</label>
                    <input className={styles.formInput} value={selectedBill.notes || ''} onChange={e => updateBillField('notes', e.target.value)} placeholder="ملاحظات أو مواصفات إضافية" />
                  </div>
                </div>

                {/* Items Section */}
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 className={styles.modalTitle} style={{ margin: 0 }}>بنود الفاتورة والمقاسات (Items)</h3>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      عدد البنود: {(selectedBill.items || []).length}
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className={styles.billItemsTable}>
                      <thead>
                        <tr>
                          <th style={{ width: '4%' }}>#</th>
                          <th style={{ width: '22%' }}>الصنف / المنتج *</th>
                          <th style={{ width: '13%' }}>طريقة الحساب</th>
                          <th style={{ width: '9%' }}>العرض (م)</th>
                          <th style={{ width: '9%' }}>الارتفاع (م)</th>
                          <th style={{ width: '7%' }}>العدد *</th>
                          <th style={{ width: '10%' }}>المساحة (م²)</th>
                          <th style={{ width: '11%' }}>سعر المتر/الوحدة *</th>
                          <th style={{ width: '11%' }}>الإجمالي (ج.م)</th>
                          <th style={{ width: '4%' }}>حذف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedBill.items || []).map((item, index) => {
                          const w = Number(item.width) || 0;
                          const h = Number(item.height) || 0;
                          const qty = Number(item.quantity) || 1;
                          const mode = item.calcType || 'square_meter';
                          let area = 0;
                          if (mode === 'square_meter') {
                            const pieceArea = (w > 0 && h > 0) ? Math.max(2, w * h) : (w * h);
                            area = pieceArea * qty;
                          } else if (mode === 'linear_width') area = w * qty;
                          else if (mode === 'linear_height') area = h * qty;
                          else area = qty;

                          return (
                            <tr key={index}>
                              <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>{index + 1}</td>
                              <td>
                                <select
                                  value={item.name}
                                  onChange={e => handleProductSelect(index, e.target.value)}
                                  className={`${styles.formInput} ${billFormSubmitted && !item.name ? styles.inputError : ''}`}
                                  style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', outline: 'none', background: 'white', textAlign: 'right' }}
                                >
                                  <option value="">-- اختر المنتج أو اكتبه --</option>
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
                                  style={{ width: '100%', padding: '4px', borderRadius: '6px' }}
                                >
                                  <option value="square_meter">متر مربع (عرض × طول × عدد)</option>
                                  <option value="linear_width">طولي عرض (عرض × عدد)</option>
                                  <option value="linear_height">طولي ارتفاع (طول × عدد)</option>
                                  <option value="unit">بالقطعة (عدد)</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={item.width || ''}
                                  onChange={e => updateBillItemField(index, 'width', e.target.value)}
                                  disabled={item.calcType === 'unit' || item.calcType === 'linear_height'}
                                  placeholder="1.5"
                                  className={billFormSubmitted && item.calcType !== 'unit' && (!item.width || Number(item.width) <= 0) ? styles.inputError : ''}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={item.height || ''}
                                  onChange={e => updateBillItemField(index, 'height', e.target.value)}
                                  disabled={item.calcType === 'unit' || item.calcType === 'linear_width'}
                                  placeholder="2.0"
                                  className={billFormSubmitted && item.calcType !== 'unit' && (!item.height || Number(item.height) <= 0) ? styles.inputError : ''}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={item.quantity || ''}
                                  onChange={e => updateBillItemField(index, 'quantity', e.target.value)}
                                  placeholder="1"
                                  className={billFormSubmitted && (!item.quantity || Number(item.quantity) <= 0) ? styles.inputError : ''}
                                />
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#3E2723', fontSize: '0.85rem' }}>
                                {area.toFixed(2)} {mode === 'unit' ? 'قطع' : 'م²'}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={item.price || ''}
                                  onChange={e => updateBillItemField(index, 'price', e.target.value)}
                                  placeholder="0"
                                  className={billFormSubmitted && (!item.price || Number(item.price) <= 0) ? styles.inputError : ''}
                                />
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#15803d', fontSize: '0.85rem' }}>
                                {Number(item.total || 0).toFixed(2)} ج.م
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => removeBillItem(index)}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
                                  title="حذف هذا البند"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {(selectedBill.items || []).length === 0 && (
                          <tr>
                            <td colSpan={10} style={{ color: '#ef4444', padding: '15px', textAlign: 'center', background: '#fef2f2' }}>
                              ⚠️ لا توجد بنود بعد. اضغط على "+ إضافة بند جديد" لإدخال المنتجات والمقاسات.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={addItemToBill}
                    style={{ background: '#3E2723', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>+</span> إضافة بند ستارة جديد
                  </button>
                </div>

                {/* Totals Section */}
                <div className={styles.totalsGrid}>
                  <div className={styles.totalsCol}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>قيمة الخصم (ج.م)</label>
                      <input type="number" className={styles.formInput} placeholder="0" value={selectedBill.discount || ''} onChange={e => updateBillField('discount', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>تكلفة التركيب (ج.م)</label>
                      <input type="number" className={styles.formInput} placeholder="0" value={selectedBill.installation_cost || ''} onChange={e => updateBillField('installation_cost', e.target.value)} />
                    </div>
                  </div>

                  <div className={styles.totalsCol}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>مصاريف النقل والشحن (ج.م)</label>
                      <input type="number" className={styles.formInput} placeholder="0" value={selectedBill.transport_cost || ''} onChange={e => updateBillField('transport_cost', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>الدفعة المقدمة / العربون (ج.م)</label>
                      <input type="number" className={styles.formInput} placeholder="0" value={selectedBill.deposit || ''} onChange={e => updateBillField('deposit', e.target.value)} />
                    </div>
                  </div>

                  <div className={styles.totalsCol} style={{ justifyContent: 'center', borderRight: '1px solid #e5e7eb', paddingRight: '20px' }}>
                    <div className={styles.totalsRow}>
                      <span>إجمالي الأصناف:</span>
                      <span style={{ fontWeight: 'bold' }}>{Number(selectedBill.total_items_price || 0).toFixed(2)} ج.م</span>
                    </div>
                    {Number(selectedBill.discount || 0) > 0 && (
                      <div className={styles.totalsRow} style={{ color: '#dc2626' }}>
                        <span>قيمة الخصم:</span>
                        <span>- {Number(selectedBill.discount || 0).toFixed(2)} ج.م</span>
                      </div>
                    )}
                    <div className={`${styles.totalsRow} ${styles.totalsRowStrong}`}>
                      <span>الإجمالي النهائي (Grand Total):</span>
                      <span style={{ color: '#3E2723', fontSize: '1.05rem' }}>{Number(selectedBill.final_total || 0).toFixed(2)} ج.م</span>
                    </div>
                    <div className={styles.totalsRow}>
                      <span>المدفوع / العربون (Advance):</span>
                      <span style={{ color: '#15803d', fontWeight: 'bold' }}>{Number(selectedBill.deposit || 0).toFixed(2)} ج.م</span>
                    </div>
                    <div className={`${styles.totalsRow} ${styles.totalsRowStrong}`} style={{ color: '#d97706', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                      <span>المتبقي للدفع (Remaining):</span>
                      <span style={{ fontSize: '1.1rem' }}>{Number(selectedBill.remaining_amount || 0).toFixed(2)} ج.م</span>
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
                    طباعة وتحميل عرض السعر (PDF)
                  </button>
                )}
                <button className={styles.saveBtn} onClick={handleSaveBill} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ الفاتورة وعرض السعر'}</button>
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
                    <input className={styles.formInput} type="number" placeholder="0" value={selectedPartner.sort_order || ''} onChange={e => setSelectedPartner({ ...selectedPartner, sort_order: Number(e.target.value) })} />
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

        {/* ── Edit User Modal ── */}
        {showEditUserModal && editingUser && (
          <div className={styles.overlay} onClick={() => setShowEditUserModal(false)}>
            <div className={styles.modal} style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>تعديل بيانات المستخدم وكلمة المرور</h2>
                <button className={styles.closeBtn} onClick={() => setShowEditUserModal(false)}>✕</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>البريد الإلكتروني</label>
                    <input
                      className={styles.formInput}
                      type="email"
                      dir="ltr"
                      value={editingUser.email}
                      disabled
                      style={{ backgroundColor: '#f5f5f5', color: '#777' }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>الاسم كامل *</label>
                    <input
                      className={styles.formInput}
                      value={editUserData.name}
                      onChange={e => setEditUserData({ ...editUserData, name: e.target.value })}
                      placeholder="أدخل اسم الموظف"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>كلمة المرور الجديدة (تغيير كلمة المرور)</label>
                    <input
                      className={styles.formInput}
                      type="password"
                      dir="ltr"
                      value={editUserData.password}
                      onChange={e => setEditUserData({ ...editUserData, password: e.target.value })}
                      placeholder="أدخل كلمة مرور جديدة أو اتركها فارغة للحفاظ على الحالية"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>الصلاحية / الدور *</label>
                    <select
                      className={styles.formInput}
                      value={editUserData.role}
                      onChange={e => setEditUserData({ ...editUserData, role: e.target.value })}
                      style={{ outline: 'none', background: 'white' }}
                    >
                      <option value="employee">موظف (Employee) - صلاحيات محدودة</option>
                      <option value="admin">مدير (Admin) - صلاحيات كاملة</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.saveBtn} onClick={handleUpdateUser} disabled={saving}>
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button className={styles.cancelBtn} onClick={() => setShowEditUserModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Settings Modal (Available Days & Working Hours) ── */}
        {showSettings && (
          <div className={styles.overlay} onClick={() => setShowSettings(false)}>
            <div className={styles.modal} style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>إعدادات المواعيد: الأيام والساعات المتاحة للحجز</h2>
                <button className={styles.closeBtn} onClick={() => setShowSettings(false)}>✕</button>
              </div>
              <div className={styles.modalBody}>
                {/* Available Days Section */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#3E2723', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📅 الأيام المتاحة للحجز (أيام العمل)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '12px' }}>
                    اختر الأيام التي يتاح للعملاء حجز معاينة أو تركيب فيها عبر الموقع:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {DAYS_NAMES.map(d => {
                      const isChecked = bookingDays.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setBookingDays(bookingDays.filter(day => day !== d.id));
                            } else {
                              setBookingDays([...bookingDays, d.id].sort());
                            }
                          }}
                          style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: isChecked ? '2px solid #3E2723' : '1px solid #e5e7eb',
                            background: isChecked ? '#3E2723' : '#fff',
                            color: isChecked ? '#fff' : '#374151',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {d.ar} {isChecked ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Hours Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#3E2723', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⏰ الساعات المتاحة (نظام 12 ساعة AM / PM)
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setBookingTimes([...ALL_POSSIBLE_TIMES])}
                        style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid #3E2723', background: '#faf7f3', cursor: 'pointer', fontWeight: '600' }}
                      >
                        تحديد الكل
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingTimes([])}
                        style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', background: '#fff', cursor: 'pointer', fontWeight: '600' }}
                      >
                        إلغاء الكل
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '12px' }}>
                    انقر على الساعات المطلوبة لتفعيلها أو إيقافها:
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {ALL_POSSIBLE_TIMES.map(t => {
                      const isChecked = bookingTimes.includes(t);
                      const label12h = formatTime12h(t, true);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setBookingTimes(bookingTimes.filter(time => time !== t));
                            } else {
                              setBookingTimes([...bookingTimes, t].sort());
                            }
                          }}
                          style={{
                            padding: '10px 4px',
                            borderRadius: '10px',
                            border: isChecked ? '2px solid #d4af37' : '1px solid #e5e7eb',
                            background: isChecked ? '#3E2723' : '#f9fafb',
                            color: isChecked ? '#fff' : '#6b7280',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div>{label12h}</div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px' }}>({t})</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.saveBtn}
                  onClick={() => {
                    saveBookingSettings({ availableDays: bookingDays, availableTimes: bookingTimes });
                    alert('تم حفظ إعدادات الأيام والساعات المتاحة بنجاح!');
                    setShowSettings(false);
                  }}
                >
                  حفظ التغييرات
                </button>
                <button className={styles.cancelBtn} onClick={() => setShowSettings(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* ── Official Crystal Blinds Quotation Print Sheet (Matches attached official template) ── */}
      {selectedBillForPrint && (
        <div className={styles.printInvoiceArea}>
          <div className={styles.quotationSheet} dir="ltr">
            {/* Top Header */}
            <div className={styles.qHeader}>
              {/* Left: Full Brand Logo & Identity */}
              <div className={styles.qBrandBlock}>
                <div className={styles.qLogoRow}>
                  <img src="/logo.png" alt="Crystal Blinds" className={styles.qLogoImg} />
                  <div className={styles.qBrandText}>
                    <span className={styles.qBrandTitle}>CRYSTAL BLINDS</span>
                    <span className={styles.qBrandSubtitle}>LUXURY CURTAINS & BLINDS</span>
                  </div>
                </div>
              </div>

              {/* Right: INVOICE Title & Meta */}
              <div className={styles.qDocTitleBlock}>
                <h1 className={styles.qDocTitle}>INVOICE</h1>
                <div className={styles.qDocMetaTable}>
                  <div className={styles.qDocMetaRow}>
                    <span className={styles.qDocMetaKey}>Invoice No.</span>
                    <span className={styles.qDocMetaColon}>:</span>
                    <span className={styles.qDocMetaVal}>
                      {selectedBillForPrint.invoice_number.startsWith('INV-') || selectedBillForPrint.invoice_number.startsWith('Q-')
                        ? selectedBillForPrint.invoice_number
                        : `INV-${selectedBillForPrint.invoice_number.replace(/^#/, '')}`}
                    </span>
                  </div>
                  <div className={styles.qDocMetaRow}>
                    <span className={styles.qDocMetaKey}>Date</span>
                    <span className={styles.qDocMetaColon}>:</span>
                    <span className={styles.qDocMetaVal}>
                      {new Date(selectedBillForPrint.created_at || selectedBillForPrint.updated_at || Date.now()).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <div className={styles.qDivider} />

            {/* 2-Column Meta Section */}
            <div className={styles.qCustomerGrid}>
              {/* Left: Customer Info */}
              <div className={styles.qCustomerCol}>
                <div className={styles.qFieldRow}>
                  <span className={styles.qFieldLabel}>Customer Name</span>
                  <span className={styles.qFieldColon}>:</span>
                  <span className={styles.qFieldValue}>{selectedBillForPrint.client_name || '—'}</span>
                </div>
                <div className={styles.qFieldRow}>
                  <span className={styles.qFieldLabel}>Phone</span>
                  <span className={styles.qFieldColon}>:</span>
                  <span className={styles.qFieldValue}>{selectedBillForPrint.client_phone || '—'}</span>
                </div>
                <div className={styles.qFieldRow}>
                  <span className={styles.qFieldLabel}>Address</span>
                  <span className={styles.qFieldColon}>:</span>
                  <span className={styles.qFieldValue}>
                    {selectedBillForPrint.client_address ||
                      orders.find((o: any) => o.client_name === selectedBillForPrint.client_name || (o.client_phone && o.client_phone === selectedBillForPrint.client_phone))?.client_address ||
                      appointments.find((a: any) => a.client_name === selectedBillForPrint.client_name || (a.client_phone && a.client_phone === selectedBillForPrint.client_phone))?.client_address ||
                      '—'}
                  </span>
                </div>
              </div>

              {/* Right: Sales & Delivery Terms */}
              <div className={styles.qCustomerCol}>
                <div className={styles.qFieldRow}>
                  <span className={styles.qFieldLabel}>Sales Representative</span>
                  <span className={styles.qFieldColon}>:</span>
                  <span className={styles.qFieldValue}>{selectedBillForPrint.sales_rep || userProfile?.name || 'هناء عبدالله'}</span>
                </div>
                <div className={styles.qFieldRow}>
                  <span className={styles.qFieldLabel}>Payment Terms</span>
                  <span className={styles.qFieldColon}>:</span>
                  <span className={styles.qFieldValue}>{selectedBillForPrint.payment_method || 'As Agreed'}</span>
                </div>
                <div className={styles.qFieldRow}>
                  <span className={styles.qFieldLabel}>Delivery Date</span>
                  <span className={styles.qFieldColon}>:</span>
                  <span className={styles.qFieldValue}>
                    {selectedBillForPrint.delivery_date
                      ? new Date(selectedBillForPrint.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'As Agreed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            {(() => {
              const actualItems = selectedBillForPrint.items || [];
              const minRows = 4;
              const paddedRowsCount = Math.max(minRows, actualItems.length);
              const rowsToRender = Array.from({ length: paddedRowsCount }, (_, i) => actualItems[i] || null);

              const subtotal = Number(selectedBillForPrint.total_items_price) || actualItems.reduce((s, it) => s + (Number(it.total) || 0), 0);
              const discountAmt = Number(selectedBillForPrint.discount) || 0;
              const discountPct = subtotal > 0 && discountAmt > 0 ? Math.round((discountAmt / subtotal) * 100) : 0;
              const deposit = Number(selectedBillForPrint.deposit) || 0;
              const finalTotal = Number(selectedBillForPrint.final_total) || Math.max(0, subtotal - discountAmt);
              const remainingBalance = Number(selectedBillForPrint.remaining_amount) || Math.max(0, finalTotal - deposit);

              return (
                <>
                  <table className={styles.qItemsTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '7%' }}>Code</th>
                        <th style={{ width: '31%' }}>Product Description</th>
                        <th style={{ width: '10%' }}>Width (m)</th>
                        <th style={{ width: '10%' }}>Height (m)</th>
                        <th style={{ width: '8%' }}>Qty</th>
                        <th style={{ width: '10%' }}>Area (m²)</th>
                        <th style={{ width: '12%' }}>Unit Price (EGP)</th>
                        <th style={{ width: '12%' }}>Total (EGP)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowsToRender.map((item, idx) => {
                        if (!item) {
                          return (
                            <tr key={idx}>
                              <td className={styles.textCenter}>{idx + 1}</td>
                              <td className={styles.textStart}>&nbsp;</td>
                              <td className={styles.textCenter}></td>
                              <td className={styles.textCenter}></td>
                              <td className={styles.textCenter}></td>
                              <td className={styles.textRight}>0.00</td>
                              <td className={styles.textRight}>0.00</td>
                              <td className={styles.textRight}>0.00</td>
                            </tr>
                          );
                        }

                        const w = Number(item.width) || 0;
                        const h = Number(item.height) || 0;
                        const q = Number(item.quantity) || 1;
                        const p = Number(item.price) || 0;
                        const mode = item.calcType || 'square_meter';

                        let calculatedArea = 0;
                        if (mode === 'square_meter') {
                          const pieceArea = (w > 0 && h > 0) ? Math.max(2, w * h) : (w * h);
                          calculatedArea = pieceArea * q;
                        } else if (mode === 'linear_width') {
                          calculatedArea = w * q;
                        } else if (mode === 'linear_height') {
                          calculatedArea = h * q;
                        } else {
                          calculatedArea = q;
                        }

                        const calculatedTotal = Number(item.total) || (mode === 'square_meter' ? calculatedArea * p : q * p);

                        return (
                          <tr key={idx}>
                            <td className={styles.textCenter} style={{ fontWeight: 'bold' }}>{idx + 1}</td>
                            <td className={styles.textStart} style={{ fontWeight: '600' }}>{item.name}</td>
                            <td className={styles.textCenter}>{mode === 'unit' || mode === 'linear_height' ? '—' : w.toFixed(2)}</td>
                            <td className={styles.textCenter}>{mode === 'unit' || mode === 'linear_width' ? '—' : h.toFixed(2)}</td>
                            <td className={styles.textCenter}>{q}</td>
                            <td className={styles.textRight}>{calculatedArea.toFixed(2)}</td>
                            <td className={styles.textRight}>{p.toFixed(2)}</td>
                            <td className={styles.textRight} style={{ fontWeight: 'bold', color: '#3E2723' }}>
                              {calculatedTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Bottom Layout: Signatures & QR (Left) + Totals Table & Company Stamp (Right) */}
                  <div className={styles.qBottomGrid}>
                    {/* Left: QR Code and Customer Signature (No terms and conditions) */}
                    <div className={styles.qNotesBox}>
                      {/* QR Code */}
                      <div className={styles.qQrRow}>
                        <div className={styles.qQrFrame}>
                          <svg viewBox="0 0 100 100" width="38" height="38">
                            <rect width="100" height="100" fill="white" />
                            <rect x="5" y="5" width="30" height="30" fill="#3E2723" />
                            <rect x="10" y="10" width="20" height="20" fill="white" />
                            <rect x="15" y="15" width="10" height="10" fill="#3E2723" />
                            <rect x="65" y="5" width="30" height="30" fill="#3E2723" />
                            <rect x="70" y="10" width="20" height="20" fill="white" />
                            <rect x="75" y="15" width="10" height="10" fill="#3E2723" />
                            <rect x="5" y="65" width="30" height="30" fill="#3E2723" />
                            <rect x="10" y="70" width="20" height="20" fill="white" />
                            <rect x="15" y="75" width="10" height="10" fill="#3E2723" />
                            <rect x="42" y="10" width="16" height="8" fill="#3E2723" />
                            <rect x="42" y="24" width="8" height="16" fill="#3E2723" />
                            <rect x="54" y="24" width="6" height="6" fill="#3E2723" />
                            <rect x="10" y="42" width="10" height="14" fill="#3E2723" />
                            <rect x="25" y="42" width="10" height="6" fill="#3E2723" />
                            <rect x="42" y="45" width="16" height="16" fill="#3E2723" />
                            <rect x="65" y="42" width="12" height="10" fill="#3E2723" />
                            <rect x="82" y="42" width="12" height="18" fill="#3E2723" />
                            <rect x="42" y="68" width="10" height="12" fill="#3E2723" />
                            <rect x="58" y="68" width="14" height="8" fill="#3E2723" />
                            <rect x="76" y="68" width="18" height="26" fill="#3E2723" />
                            <rect x="42" y="85" width="20" height="10" fill="#3E2723" />
                          </svg>
                        </div>
                        <div className={styles.qQrText}>
                          Scan to visit<br />our website
                        </div>
                      </div>

                      {/* Customer Signature */}
                      <div className={styles.qSignBlock}>
                        <div className={styles.qSignLabel}>Customer Signature</div>
                        <div className={styles.qSignUnderline}></div>
                      </div>
                    </div>

                    {/* Right: Summary Table & Company Stamp */}
                    <div>
                      <table className={styles.qSummaryTable}>
                        <tbody>
                          <tr>
                            <td className={styles.qSumKey}>Subtotal</td>
                            <td className={styles.qSumVal}>EGP {subtotal.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className={styles.qSumKey}>Discount Percentage (%)</td>
                            <td className={styles.qSumVal}>{discountPct}%</td>
                          </tr>
                          <tr>
                            <td className={styles.qSumKey}>Discount Amount</td>
                            <td className={styles.qSumVal}>EGP {discountAmt.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className={styles.qSumKey}>Advance Payment</td>
                            <td className={styles.qSumVal}>EGP {deposit.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className={styles.qSumKey}>Remaining Balance</td>
                            <td className={styles.qSumVal}>EGP {remainingBalance.toFixed(2)}</td>
                          </tr>
                          <tr className={styles.qGrandTotalTr}>
                            <td className={styles.qSumKey} style={{ color: '#ffffff' }}>Grand Total</td>
                            <td className={styles.qSumVal}>EGP {finalTotal.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Company Stamp & Signature */}
                      <div className={styles.qSignBlock} style={{ textAlign: 'left' }}>
                        <div className={styles.qSignLabel}>Company Stamp & Signature</div>
                        <div className={styles.qSignUnderline}></div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar at the very bottom of the Invoice */}
                  <div className={styles.qFooterBar}>
                    <div className={styles.qFooterGreeting}>
                      شكراً لاختياركم كريستال للستائر - يسعدنا خدمتكم دائماً
                    </div>
                    <div className={styles.qFooterContactRow}>
                      <span>📞 +20 110 008 0609 | +20 102 090 9498 | +20 24 2245 466</span>
                      <span>📍 شبرا الخيمة - 74 شارع 15 مايو أمام مجمع الصوالحة الإسلامي</span>
                      <span>🌐 www.crystalblinds.com</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
