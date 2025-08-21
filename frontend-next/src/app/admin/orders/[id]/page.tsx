'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function AdminOrderDetailPage() {
	const router = useRouter()
	const params = useParams()
	const { user, loading, isAdmin } = useAuth()
	const [order, setOrder] = React.useState<any | null>(null)
	const [fetching, setFetching] = React.useState(true)

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
							<div>Төлөв: {order.status}</div>
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


