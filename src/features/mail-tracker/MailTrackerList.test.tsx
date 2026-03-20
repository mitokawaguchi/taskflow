import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MailTrackerList } from './MailTrackerList'

const mailSample = {
  kind: 'mail' as const,
  id: '1',
  threadId: 't1',
  from: 'a@b',
  subject: 'Sub',
  receivedAt: '2025-03-01T00:00:00.000Z',
  gmailWebUrl: 'https://mail.google.com/',
}

describe('MailTrackerList', () => {
  it('件数を表示', () => {
    const { container } = render(
      <MailTrackerList
        tab="all"
        onTabChange={vi.fn()}
        rows={[mailSample]}
        counts={{ mail: 1, chatwork: 0 }}
        loadingMail={false}
        loadingChatwork={false}
        onRefresh={vi.fn()}
      />,
    )
    const countLine = container.querySelector('.mt-count')
    expect(countLine).not.toBeNull()
    expect(countLine).toHaveTextContent(/表示中:\s*1/)
  })

  it('手動更新で onRefresh', () => {
    const onRefresh = vi.fn()
    render(
      <MailTrackerList
        tab="all"
        onTabChange={vi.fn()}
        rows={[]}
        counts={{ mail: 0, chatwork: 0 }}
        loadingMail={false}
        loadingChatwork={false}
        onRefresh={onRefresh}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '手動更新' }))
    expect(onRefresh).toHaveBeenCalled()
  })
})
