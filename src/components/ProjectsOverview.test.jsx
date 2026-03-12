import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectsOverview from './ProjectsOverview'

describe('ProjectsOverview', () => {
  it('renders section header and プロジェクト追加 button', () => {
    render(
      <ProjectsOverview
        showDone={false}
        setShowDone={vi.fn()}
        onAddProject={vi.fn()}
        sensors={[]}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
        activeProjects={[]}
        completedProjects={[]}
        dragActiveId={null}
        renderProjectCard={vi.fn(() => null)}
        setView={vi.fn()}
        toggleTask={vi.fn()}
        openTaskFormForProject={vi.fn()}
      />
    )
    expect(screen.getByText('+ プロジェクト追加')).toBeInTheDocument()
    expect(screen.getByText('完了を表示')).toBeInTheDocument()
  })

  it('renders 完了したプロジェクト when completedProjects is not empty', () => {
    const renderProjectCard = vi.fn(({ project }) => <div key={project.id}>{project.name}</div>)
    render(
      <ProjectsOverview
        showDone={true}
        setShowDone={vi.fn()}
        onAddProject={vi.fn()}
        sensors={[]}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
        activeProjects={[]}
        completedProjects={[
          { project: { id: 'p1', name: 'Done', color: '#333', icon: '📁' }, ptasks: [], pct: 100 },
        ]}
        dragActiveId={null}
        renderProjectCard={renderProjectCard}
        setView={vi.fn()}
        toggleTask={vi.fn()}
        openTaskFormForProject={vi.fn()}
      />
    )
    expect(screen.getByText('完了したプロジェクト')).toBeInTheDocument()
    expect(renderProjectCard).toHaveBeenCalled()
  })
})
