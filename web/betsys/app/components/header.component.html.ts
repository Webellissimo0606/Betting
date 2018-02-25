export const htmlTemplate = `
  <!--Navigation bar-->
  <div class="header">
    
    <!--left pane of navigation, avatar, name, ...-->
    <div class="left-pane">
      <div class="user-avatar">
        <img src="{{user.avatarURL}}" alt="Your Avatar">
      </div>
      <div class="user-info">
        <div>{{user.name}}</div>
        <div>Version {{user.version}}</div>
      </div>
    </div>

    <!--right pane of navigation, some others maybe..-->
    <div class="right-pane">
      <div class="user-panel">
      </div>
    </div>
    
  </div>
`;