import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CouponPickerDrawer from '../components/checkout/CouponPickerDrawer';
import axiosInstance from '../api/axios';

// Mock axiosInstance
vi.mock('../api/axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

describe('CouponPickerDrawer Component Unit Tests', () => {
  const mockOnClose = vi.fn();
  const mockOnApplyCoupon = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    cartSubtotal: 50,
    cartItems: [],
    onApplyCoupon: mockOnApplyCoupon,
    appliedCouponCode: undefined,
  };

  const mockCoupons = [
    {
      _id: 'coupon-1',
      code: 'WELCOME10',
      discountType: 'FIXED' as const,
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscount: 0,
      validUntil: '2026-12-31T23:59:59.000Z',
      firstTimeOnly: false,
      usageLimitPerUser: 1,
    },
    {
      _id: 'coupon-2',
      code: 'SUPER50',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      minOrderAmount: 100, // Locked (since subtotal is 50)
      maxDiscount: 50,
      validUntil: '2026-12-31T23:59:59.000Z',
      firstTimeOnly: false,
      usageLimitPerUser: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render headers and loading spinner initially', async () => {
    // Mock API to remain unresolved to keep it in loading state
    vi.mocked(axiosInstance.get).mockReturnValue(new Promise(() => {}));

    render(<CouponPickerDrawer {...defaultProps} />);

    expect(screen.getByText('Available Coupons')).toBeInTheDocument();
    expect(screen.getByText('FETCHING PROMOTIONS')).toBeInTheDocument();
  });

  it('should render coupons list successfully when API resolves', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { success: true, data: mockCoupons },
    });

    render(<CouponPickerDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('FETCHING PROMOTIONS')).not.toBeInTheDocument();
    });

    expect(screen.getByText('WELCOME10')).toBeInTheDocument();
    expect(screen.getByText('₹10 OFF')).toBeInTheDocument();

    expect(screen.getByText('SUPER50')).toBeInTheDocument();
    expect(screen.getByText('10% OFF')).toBeInTheDocument();
  });

  it('should show lock indicator and calculate difference for locked coupons', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { success: true, data: mockCoupons },
    });

    render(<CouponPickerDrawer {...defaultProps} cartSubtotal={60} />);

    await waitFor(() => {
      expect(screen.getByText('WELCOME10')).toBeInTheDocument();
    });

    // WELCOME10 has minOrderAmount of 0 (eligible)
    const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
    expect(applyButtons.length).toBe(1);

    // SUPER50 has minOrderAmount of 100 (ineligible, need ₹40 more)
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByText(/Add/)).toHaveTextContent('Add ₹40.00 more to unlock');
  });

  it('should trigger onApplyCoupon when Apply button is clicked', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { success: true, data: mockCoupons },
    });

    render(<CouponPickerDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('WELCOME10')).toBeInTheDocument();
    });

    const applyBtn = screen.getByRole('button', { name: 'Apply' });
    fireEvent.click(applyBtn);

    expect(mockOnApplyCoupon).toHaveBeenCalledWith('WELCOME10');
    expect(mockOnClose).toHaveBeenCalled();
  });
});
