export const seedState = {
  params: [
    {
      id: 'ORG-DEPT',
      code: 'ORG-DEPT',
      name: '組織部門',
      type: 'TREE',
      items: [
        { id: 'ORG-ROOT', code: 'ROOT', name: '總公司', parentCode: '' },
        { id: 'ORG-IT', code: 'IT', name: '資訊部', parentCode: 'ROOT' },
        { id: 'ORG-HR', code: 'HR', name: '人資部', parentCode: 'ROOT' }
      ]
    }
  ],
  formSchemas: {
    BPM_FORM: [
      { key: 'requestNo', label: '申請單號', type: 'text', required: true },
      { key: 'dept', label: '部門', type: 'select', optionsCode: 'ORG-DEPT', required: true },
      { key: 'amount', label: '金額', type: 'number', required: true },
      { key: 'reason', label: '原因', type: 'textarea' }
    ]
  },
  workflowDefinitions: {
    PURCHASE: {
      code: 'PURCHASE',
      name: '採購流程',
      states: ['Draft', 'Submitted', 'Approved', 'Rejected'],
      transitions: [
        { from: 'Draft', to: 'Submitted', label: '送出', roles: ['USER', 'MANAGER', 'ADMIN'] },
        { from: 'Submitted', to: 'Approved', label: '核准', roles: ['MANAGER', 'ADMIN'] },
        { from: 'Submitted', to: 'Rejected', label: '退回', roles: ['MANAGER', 'ADMIN'] }
      ]
    }
  }
};
