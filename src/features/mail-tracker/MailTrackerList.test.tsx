import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MailTrackerList } from './MailTrackerList'

const sample = [
  {
    id: '1',
    threadId: 't1',
    from: 'a@b',
    subject: 'Sub',
    receivedAt: '2025-03-01T00:00:00.000Z',
    gmailWebUrl: 'https://mail.google.com/',
  },
]

describe('MailTrackerList', () => {
  it('件数を表示', () => {
    render(<MailTrackerList loading={false} items={sample} onRefresh={vi.fn()} />)
    expect(screen.getByText(/未返信:\s*1/)).toBeTruthy()
  })

  it('手動更新で onRefresh', () => {
    const onRefresh = vi.fn()
    render(<MailTrackerList loading={false} items={[]} onRefresh={onRefresh} />)
    fireEvent.click(screen.getByRole('button', { name: '手動更新' }))
    expect(onRefresh).toHaveBeenCalled()
  })
})
