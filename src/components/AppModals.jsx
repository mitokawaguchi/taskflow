/**
 * アプリ全体のモーダル・オーバーレイ（タスク・プロジェクト・テンプレート・クライアント・設定・プロフィール・Toast）
 * ARCH-001: App.jsx 200行以下化のため抽出
 */
import TaskForm from '../TaskForm'
import ProjectForm from '../ProjectForm'
import TemplateForm from '../TemplateForm'
import ClientForm from '../ClientForm'
import SettingsModal from './SettingsModal'
import ProfileModal from './ProfileModal'
import Toast from '../Toast'
import CompleteNextTaskModal from './CompleteNextTaskModal'

export default function AppModals({
  showTaskForm,
  editTask,
  taskFormInitialTask,
  projects,
  templates,
  categories,
  usersForTaskForm,
  onSaveTask,
  onCloseTaskForm,
  showProjForm,
  editProject,
  onSaveProject,
  onCloseProjForm,
  showTplForm,
  editTemplate,
  onSaveTemplate,
  onRemoveTemplate,
  onCloseTplForm,
  showClientForm,
  editClient,
  onSaveClient,
  onRemoveClient,
  onCloseClientForm,
  showSettings,
  theme,
  setTheme,
  onCloseSettings,
  users,
  setUsers,
  notifyReminderEnabled,
  setNotifyReminderEnabled,
  addToast,
  showProfileModal,
  authUser,
  onCloseProfile,
  setAuthUser,
  toasts,
  completeNextTask,
  onCompleteNextSkip,
  onCompleteNextCreate,
  onCompleteNextCancel,
}) {
  return (
    <>
      {(showTaskForm || editTask) && (
        <TaskForm
          task={taskFormInitialTask}
          projects={projects}
          templates={templates}
          categories={categories}
          users={usersForTaskForm}
          onSave={onSaveTask}
          onClose={onCloseTaskForm}
          onNotifyValidation={(detail) => addToast('❌', '保存できませんでした', detail)}
        />
      )}
      {showProjForm && (
        <ProjectForm
          project={editProject}
          onSave={onSaveProject}
          onClose={onCloseProjForm}
          onNotifyValidation={(detail) => addToast('❌', '保存できませんでした', detail)}
        />
      )}
      {showTplForm && (
        <TemplateForm
          template={editTemplate}
          onSave={onSaveTemplate}
          onDelete={onRemoveTemplate}
          onClose={onCloseTplForm}
        />
      )}
      {showClientForm && (
        <ClientForm
          client={editClient}
          onSave={onSaveClient}
          onDelete={onRemoveClient}
          onClose={onCloseClientForm}
        />
      )}
      {showSettings && (
        <SettingsModal
          theme={theme}
          setTheme={setTheme}
          onClose={onCloseSettings}
          users={users}
          setUsers={setUsers}
          notifyReminderEnabled={notifyReminderEnabled}
          setNotifyReminderEnabled={setNotifyReminderEnabled}
          addToast={addToast}
        />
      )}
      {showProfileModal && (
        <ProfileModal authUser={authUser} onClose={onCloseProfile} addToast={addToast} setAuthUser={setAuthUser} />
      )}
      {completeNextTask && (
        <CompleteNextTaskModal
          task={completeNextTask}
          onSkip={onCompleteNextSkip}
          onCreateNext={onCompleteNextCreate}
          onClose={onCompleteNextCancel}
        />
      )}
      <Toast toasts={toasts} />
    </>
  )
}
