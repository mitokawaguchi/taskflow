/**
 * プロジェクト・クライアント・テンプレート・カテゴリ系ビュー。ARCH-001: App.jsx 短縮のため抽出
 */
import ProjectDetail from '../ProjectDetail'
import ClientsListView from './ClientsListView'
import CategoriesView from './CategoriesView'
import ClientDetailView from './ClientDetailView'
import ProjectsOverview from './ProjectsOverview'
import TemplatesListView from './TemplatesListView'
import BossFeedbackScreen from '../features/boss-feedback/BossFeedbackScreen'
import MailTrackerScreen from '../features/mail-tracker/MailTrackerScreen'

export default function ContentArea({
  view,
  isProjectView,
  currentProject,
  tasks,
  projects,
  categories,
  users,
  projectsMap,
  usersMap,
  toggleTask,
  setEditTask,
  setShowTaskForm,
  setEditProject,
  setShowProjForm,
  updateProjectEndDate,
  sort,
  setSort,
  showDone,
  setShowDone,
  clients,
  remembers,
  setEditClient,
  setShowClientForm,
  setView,
  setSidebarOpen,
  addRemember,
  updateRememberItem,
  removeRemember,
  setCategories,
  addToast,
  sensors,
  setDragActiveId,
  handleProjectDragEnd,
  activeProjects,
  completedProjects,
  dragActiveId,
  renderProjectCard,
  openTaskFormForProject,
  templates,
  setEditTemplate,
  setShowTplForm,
}) {
  if (isProjectView && currentProject) {
    return (
      <ProjectDetail
        project={currentProject}
        tasks={tasks}
        projects={projects}
        categories={categories}
        users={users}
        projectsMap={projectsMap}
        usersMap={usersMap}
        onToggle={toggleTask}
        onEditTask={setEditTask}
        onAddTask={() => setShowTaskForm(true)}
        onEditProject={() => {
          setEditProject(currentProject)
          setShowProjForm(true)
        }}
        onUpdateProjectEndDate={updateProjectEndDate}
        sort={sort}
        setSort={setSort}
        showDone={showDone}
      />
    )
  }
  if (view === 'clients') {
    return (
      <>
        <div className="toolbar-row">
          <button type="button" className="btn btn-primary" onClick={() => { setEditClient(null); setShowClientForm(true) }}>
            + クライアント追加
          </button>
        </div>
        <ClientsListView
          clients={clients}
          remembers={remembers}
          onAddClient={() => { setEditClient(null); setShowClientForm(true) }}
          onEditClient={(c) => { setEditClient(c); setShowClientForm(true) }}
          onOpenClientDetail={(id) => { setView('c:' + id); setSidebarOpen(false) }}
        />
      </>
    )
  }
  if (view === 'categories') {
    return <CategoriesView categories={categories} setCategories={setCategories} addToast={addToast} />
  }
  if (view.startsWith('c:')) {
    return (
      <ClientDetailView
        clientId={view.slice(2)}
        clients={clients}
        remembers={remembers}
        onBack={() => setView('clients')}
        onAddRemember={addRemember}
        onUpdateRemember={updateRememberItem}
        onDeleteRemember={removeRemember}
      />
    )
  }
  if (view === 'projects') {
    return (
      <ProjectsOverview
        showDone={showDone}
        setShowDone={setShowDone}
        onAddProject={() => { setEditProject(null); setShowProjForm(true) }}
        sensors={sensors}
        onDragStart={setDragActiveId}
        onDragEnd={(e) => handleProjectDragEnd(e, setDragActiveId)}
        activeProjects={activeProjects}
        completedProjects={completedProjects}
        dragActiveId={dragActiveId}
        renderProjectCard={renderProjectCard}
        setView={setView}
        toggleTask={toggleTask}
        openTaskFormForProject={openTaskFormForProject}
      />
    )
  }
  if (view === 'templates') {
    return (
      <>
        <div className="toolbar-row">
          <button type="button" className="btn btn-primary" onClick={() => { setEditTemplate(null); setShowTplForm(true) }}>
            + テンプレート作成
          </button>
        </div>
        <TemplatesListView
          templates={templates}
          onAddTemplate={() => { setEditTemplate(null); setShowTplForm(true) }}
          onEditTemplate={(t) => { setEditTemplate(t); setShowTplForm(true) }}
          onUseTemplate={() => setShowTaskForm(true)}
        />
      </>
    )
  }
  if (view === 'boss-feedback') {
    return <BossFeedbackScreen addToast={addToast} />
  }
  if (view === 'mail-tracker') {
    return <MailTrackerScreen addToast={addToast} />
  }
  return null
}
