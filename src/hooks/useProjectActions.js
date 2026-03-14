import { useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { insertProject, updateProject } from '../api'

/** プロジェクトの保存・終了日更新・ドラッグ並び替えを集約。ARCH-001 */
export function useProjectActions(
  projects,
  setProjects,
  activeProjects,
  completedProjects,
  addToast,
  editProject,
  setShowProjForm,
  setEditProject
) {
  const saveProject = useCallback(
    async (form) => {
      try {
        if (editProject) {
          const updated = await updateProject(editProject.id, {
            name: form.name,
            icon: form.icon,
            color: form.color,
            endDate: form.endDate ?? '',
          })
          setProjects((ps) => ps.map((p) => (p.id === updated.id ? updated : p)))
          setShowProjForm(false)
          setEditProject(null)
          addToast('✏️', 'プロジェクトを更新しました', form.name)
        } else {
          const nextOrder = projects.length ? Math.max(...projects.map((p) => p.sortOrder ?? 0), -1) + 1 : 0
          const project = { ...form, id: `p-${crypto.randomUUID()}`, endDate: form.endDate ?? '', sortOrder: nextOrder }
          const created = await insertProject(project)
          setProjects((ps) => [...ps, created])
          setShowProjForm(false)
          addToast('📁', 'プロジェクト作成', form.name)
        }
      } catch (e) {
        addToast('❌', editProject ? '更新できませんでした' : '作成できませんでした', e?.message ?? '')
      }
    },
    [addToast, projects, editProject, setShowProjForm, setEditProject]
  )

  const updateProjectEndDate = useCallback(
    async (projectId, endDate) => {
      try {
        const updated = await updateProject(projectId, { endDate: endDate || '' })
        setProjects((ps) => ps.map((p) => (p.id === projectId ? updated : p)))
        addToast('📅', '終了日を更新しました', '')
      } catch (e) {
        addToast('❌', '更新できませんでした', e?.message ?? '')
      }
    },
    [addToast]
  )

  const handleProjectDragEnd = useCallback(
    async (event, setDragActiveId) => {
      const { active, over } = event
      setDragActiveId(null)
      if (!over || active.id === over.id) return
      const oldIndex = activeProjects.findIndex((x) => x.project.id === active.id)
      const newIndex = activeProjects.findIndex((x) => x.project.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(activeProjects, oldIndex, newIndex)
      const newProjects = [
        ...reordered.map((x) => x.project),
        ...completedProjects.map((x) => x.project),
      ].map((p, i) => ({ ...p, sortOrder: i }))
      setProjects(newProjects)
      try {
        await Promise.all(newProjects.map((p, i) => updateProject(p.id, { sortOrder: i })))
        addToast('📁', '並び順を更新しました', '')
      } catch (e) {
        addToast('❌', '並び順の保存に失敗しました', e?.message ?? '')
      }
    },
    [activeProjects, completedProjects, addToast]
  )

  return { saveProject, updateProjectEndDate, handleProjectDragEnd }
}
