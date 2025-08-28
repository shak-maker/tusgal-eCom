'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { getMongolianStatus, getAvailableStatuses } from '@/lib/orderStatusMap'

export default function AdminOrderDetailPage() {
	const router = useRouter()
	const params = useParams()
	const { user, loading, isAdmin } = useAuth()
	const [order, setOrder] = React.useState<any | null>(null)
	const [fetching, setFetching] = React.useState(true)
	const [updating, setUpdating] = React.useState(false)

	React.useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push('/login')
				return
			}
			if (!isAdmin) {
				router.push('/')
				return
			}
		}
	}, [user, loading, isAdmin, router])

	React.useEffect(() => {
		const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id?.[0] : ''
		if (!id) return
		;(async () => {
			try {
				setFetching(true)
				const res = await fetch(`/api/admin/orders/${id}`)
				if (res.ok) {
					const data = await res.json()
					setOrder(data)
				}
			} finally {
				setFetching(false)
			}
		})()
	}, [params])

	const updateOrderStatus = async (newStatus: string) => {
		try {
			setUpdating(true)
			console.log('🔄 Updating order status:', { orderId: order.id, newStatus })
			
			const response = await fetch(`/api/admin/orders/${order.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status: newStatus }),
			})

			console.log('📡 Response status:', response.status)
			
			if (response.ok) {
				const updatedOrder = await response.json()
				console.log('✅ Order updated successfully:', updatedOrder)
				setOrder(updatedOrder)
			} else {
				const errorData = await response.json().catch(() => ({}))
				console.error('❌ Failed to update order status:', errorData)
				alert(`Failed to update order status: ${errorData.error || 'Unknown error'}`)
			}
		} catch (error) {
			console.error('💥 Error updating order status:', error)
			alert(`Error updating order status: ${error}`)
		} finally {
			setUpdating(false)
		}
	}

	if (loading || fetching) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<p className="text-gray-600">Уншиж байна...</p>
			</div>
		)
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<p className="text-gray-600">Захиалга олдсонгүй</p>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">Захиалга #{order.id?.slice(-8)}</h1>
					<Link href="/admin/orders" className="text-blue-600 hover:underline">Буцах</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="bg-white p-6 rounded-lg shadow">
						<h2 className="text-lg font-semibold mb-4">Хэрэглэгч</h2>
						<div className="space-y-2 text-sm text-gray-800">
							<div>Имэйл: {order.email}</div>
							<div>Утас: {order.phone}</div>
							<div>Хаяг: {order.shippingAddress}</div>
						</div>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h2 className="text-lg font-semibold mb-4">Захиалгын мэдээлэл</h2>
						<div className="space-y-2 text-sm text-gray-800">
							<div className="flex items-center gap-3">
								<span>Төлөв:</span>
								<select
									value={order.status}
									onChange={(e) => updateOrderStatus(e.target.value)}
									disabled={updating}
									className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white"
								>
									{getAvailableStatuses().map((status) => (
										<option key={status.value} value={status.value}>
											{status.label}
										</option>
									))}
								</select>
								{updating && <span className="text-blue-600 text-xs">Шинэчилж байна...</span>}
							</div>
							<div>Нийт дүн: ₮{order.totalAmount?.toLocaleString?.() ?? order.totalAmount}</div>
							<div>PD (см): {typeof order.pdCm === 'number' ? order.pdCm : '—'}</div>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-4">Бараанууд</h2>
					<div className="divide-y">
						{order.items?.map((it: any) => (
							<div key={it.id} className="py-3 flex items-center justify-between text-sm">
								<div>
									<div className="font-medium">{it.product?.name}</div>
									<div className="text-gray-600">Ангилал: {it.product?.category?.name ?? '—'}</div>
								</div>
								<div className="text-gray-800">x{it.quantity}</div>
								<div className="font-semibold">₮{(it.price * it.quantity).toLocaleString()}</div>
							</div>
						))}
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-2">Лензийн мэдээлэл</h2>
					{order.lensInfo ? (
						<pre className="text-sm bg-gray-50 border rounded p-3 overflow-auto">{JSON.stringify(order.lensInfo, null, 2)}</pre>
					) : (
						<p className="text-sm text-gray-600">Илгээгдээгүй</p>
					)}
				</div>
			</div>
		</div>
	)
}


