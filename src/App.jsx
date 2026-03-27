import MorningModal from './MorningModal'
import Toast from './Toast'
import LoginScreen from './components/LoginScreen'
import { PublicDemoPage } from './components/PublicDemoPage'
import LegalPageView from './components/LegalPageView'
import { getIsPublicDemoMode } from './config/publicDemoMode'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import AppModals from './components/AppModals'
import ContentArea from './components/ContentArea'
import ContentAreaTasks from './components/ContentAreaTasks'
import { useApp } from './hooks/useApp'
import { today } from './utils'

export default function App() {
  const app = useApp()

  if (!app.authReady) {
    return (
      <div className="app app-loading">
        <p className="text-muted">認証確認中...</p>
      </div>
    )
  }
  if (app.legalPage) {
    return <LegalPageView pageKey={app.legalPage} onBack={() => { window.location.hash = '' }} />
  }
  if (!app.authUser) {
    if (getIsPublicDemoMode()) {
      const repoUrl = import.meta.env.VITE_PUBLIC_REPO_URL
      return (
        <>
          <PublicDemoPage repositoryUrl={typeof repoUrl === 'string' ? repoUrl : undefined} />
          <Toast toasts={app.toasts} />
        </>
      )
    }
    return (
      <>
        <LoginScreen onError={app.addToast} />
        <Toast toasts={app.toasts} />
      </>
    )
  }
  if (app.loading) {
    return (
      <div className="app app-loading">
        <p className="text-muted">読み込み中...</p>
      </div>
    )
  }

  return (
    <>
      {app.showMorning && (
        <MorningModal
          tasks={app.tasks}
          projects={app.projects}
          onClose={() => { app.setShowMorning(false); localStorage.setItem('tf_morning', today()) }}
        />
      )}
      <div className={`app ${app.sidebarOpen ? 'sidebar-open' : ''}`}>
        {app.sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => app.setSidebarOpen(false)} aria-hidden="true" />
        )}
        <Sidebar
          tasks={app.tasks} projects={app.projects} users={app.users} view={app.view} setView={app.setView}
          todayCount={app.todayCount} overdueCount={app.overdueCount} sidebarOpen={app.sidebarOpen} setSidebarOpen={app.setSidebarOpen}
          sidebarProjectsOpen={app.sidebarProjectsOpen} setSidebarProjectsOpen={app.setSidebarProjectsOpen}
          notifGranted={app.notifGranted} requestNotif={app.requestNotif}
          onAddProject={() => { app.setEditProject(null); app.setShowProjForm(true) }}
          filterAssigneeId={app.filterAssigneeId} setFilterAssigneeId={app.setFilterAssigneeId} setFilterOpen={app.setFilterOpen}
          onOpenSettings={() => { app.setShowSettings(true); app.setSidebarOpen(false) }}
          onOpenProfile={() => { app.setShowProfileModal(true); app.setSidebarOpen(false) }}
          onShowMorning={() => app.setShowMorning(true)}
        />
        <div className="main">
          <TopBar
            view={app.view} isProjectView={app.isProjectView} setView={app.setView} viewTitle={app.viewTitle} viewTabs={app.viewTabs}
            isMainView={app.isMainView} theme={app.theme} setTheme={app.setTheme} setSidebarOpen={app.setSidebarOpen}
            setFilterOpen={app.setFilterOpen} activeFilterCount={app.activeFilterCount} searchQuery={app.searchQuery} setSearchQuery={app.setSearchQuery}
            todayCount={app.todayCount} overdueCount={app.overdueCount} onShowMorning={() => app.setShowMorning(true)}
            onShowProfile={() => app.setShowProfileModal(true)} showDone={app.showDone} setShowDone={app.setShowDone}
            onAddTask={() => app.setShowTaskForm(true)}
          />
          <div className="content">
            <div key={app.view} className="content-view">
              {['kanban', 'dashboard', 'gantt', 'all', 'today', 'overdue'].includes(app.view) ? (
                <ContentAreaTasks
                  view={app.view} tasksForBoard={app.tasksForBoard} projects={app.projects} categories={app.categories} users={app.users}
                  projectsMap={app.projectsMap} usersMap={app.usersMap} moveTaskStatus={app.moveTaskStatus}
                  setEditTask={app.setEditTask} setShowTaskForm={app.setShowTaskForm} openTaskFormForKanbanColumn={app.openTaskFormForKanbanColumn}
                  filterOpen={app.filterOpen} setFilterOpen={app.setFilterOpen} hasAnyFilter={app.hasAnyFilter}
                  filterProjectIds={app.filterProjectIds} setFilterProjectIds={app.setFilterProjectIds}
                  filterPriorities={app.filterPriorities} setFilterPriorities={app.setFilterPriorities}
                  filterAssigneeId={app.filterAssigneeId} setFilterAssigneeId={app.setFilterAssigneeId}
                  filterDueFrom={app.filterDueFrom} setFilterDueFrom={app.setFilterDueFrom} filterDueTo={app.filterDueTo} setFilterDueTo={app.setFilterDueTo}
                  filterPriorityFrom={app.filterPriorityFrom} setFilterPriorityFrom={app.setFilterPriorityFrom}
                  filterPriorityTo={app.filterPriorityTo} setFilterPriorityTo={app.setFilterPriorityTo}
                  sort={app.sort} setSort={app.setSort} sortedTasks={app.sortedTasks} taskFiltersClear={app.taskFiltersClear}
                  onAddTask={() => app.setShowTaskForm(true)} onEditTask={(t) => { app.setEditTask(t); app.setShowTaskForm(true) }} onToggleTask={app.toggleTask}
                />
              ) : (
                <ContentArea
                  view={app.view} isProjectView={app.isProjectView} currentProject={app.currentProject}
                  tasks={app.tasks} projects={app.projects} categories={app.categories} users={app.users}
                  projectsMap={app.projectsMap} usersMap={app.usersMap} toggleTask={app.toggleTask}
                  setEditTask={app.setEditTask} setShowTaskForm={app.setShowTaskForm} setEditProject={app.setEditProject} setShowProjForm={app.setShowProjForm}
                  updateProjectEndDate={app.updateProjectEndDate} sort={app.sort} setSort={app.setSort} showDone={app.showDone} setShowDone={app.setShowDone}
                  clients={app.clients} remembers={app.remembers} setEditClient={app.setEditClient} setShowClientForm={app.setShowClientForm}
                  setView={app.setView} setSidebarOpen={app.setSidebarOpen} addRemember={app.addRemember} updateRememberItem={app.updateRememberItem} removeRemember={app.removeRemember}
                  setCategories={app.setCategories} addToast={app.addToast} sensors={app.sensors} setDragActiveId={app.setDragActiveId} handleProjectDragEnd={app.handleProjectDragEnd}
                  activeProjects={app.activeProjects} completedProjects={app.completedProjects} dragActiveId={app.dragActiveId}
                  renderProjectCard={app.renderProjectCard} openTaskFormForProject={app.openTaskFormForProject}
                  templates={app.templates} setEditTemplate={app.setEditTemplate} setShowTplForm={app.setShowTplForm}
                  theme={app.theme}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <AppModals
        showTaskForm={app.showTaskForm} editTask={app.editTask} taskFormInitialTask={app.taskFormInitialTask}
        projects={app.projects} templates={app.templates} categories={app.categories} usersForTaskForm={app.usersForTaskForm}
        onSaveTask={app.saveTask} onCloseTaskForm={app.closeTaskForm}
        showProjForm={app.showProjForm} editProject={app.editProject} onSaveProject={app.saveProject}
        onCloseProjForm={() => { app.setShowProjForm(false); app.setEditProject(null) }}
        showTplForm={app.showTplForm} editTemplate={app.editTemplate} onSaveTemplate={app.saveTemplate} onRemoveTemplate={app.removeTemplate}
        onCloseTplForm={() => { app.setShowTplForm(false); app.setEditTemplate(null) }}
        showClientForm={app.showClientForm} editClient={app.editClient} onSaveClient={app.saveClient} onRemoveClient={app.removeClient}
        onCloseClientForm={() => { app.setShowClientForm(false); app.setEditClient(null) }}
        showSettings={app.showSettings} theme={app.theme} setTheme={app.setTheme} onCloseSettings={() => app.setShowSettings(false)}
        users={app.users} setUsers={app.setUsers} notifyReminderEnabled={app.notifyReminderEnabled} setNotifyReminderEnabled={app.setNotifyReminderEnabled}
        addToast={app.addToast} showProfileModal={app.showProfileModal} authUser={app.authUser}
        onCloseProfile={() => app.setShowProfileModal(false)} setAuthUser={app.setAuthUser} toasts={app.toasts}
      />
    </>
  )
}
