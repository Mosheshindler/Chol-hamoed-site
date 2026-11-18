import {NextResponse} from 'next/server'
import {findDiscount} from '@/lib/discountCodes'
import {PACKAGE_NAMES} from '@/lib/packages'

// Checkout's "Apply" button: checks a code and returns its rule so the form can show the new total.
// The order API checks it again when the order is placed.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const names = (Array.isArray(body.packages) ? body.packages : []).filter(n => PACKAGE_NAMES.includes(n))
  const {rule, error} = await findDiscount(body.code, names)
  if (error) return NextResponse.json({error}, {status: 400})
  const {id, ...pub} = rule
  return NextResponse.json({rule: pub})
}
