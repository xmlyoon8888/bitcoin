import numpy as np
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# 한글 폰트 설정: NanumGothic.ttf 경로를 지정하여 한글이 깨지지 않도록 함
font_path = '/Users/happyyoon/fonts/NanumGothic.ttf'  # 사용할 한글 폰트 파일 경로
font_prop = fm.FontProperties(fname=font_path)
# plt.rc('font', family=font_prop.get_name())
plt.rcParams['axes.unicode_minus'] = False  # 마이너스 기호 깨짐 방지

# 데이터
labels = ['교환 매개체', '가치 저장', '가치 척도', '희소성', '대체가능성', '통일성', '내구성', '구별성']
gold = [3,5,2,5,3,3,5,4] # 금
fiat = [5,3,5,2,5,5,4,3] # 법정화폐
bitcoin = [4,5,4,5,5,5,5,5] # 비트코인

# 레이더 차트 그리기
num_vars = len(labels)

# 각 속성의 각도를 계산
angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()

# 데이터가 원형으로 연결되도록 마지막 값을 추가
gold += gold[:1]
fiat += fiat[:1]
bitcoin += bitcoin[:1]
angles += angles[:1]

# 차트 설정
fig, ax = plt.subplots(figsize=(16, 10), subplot_kw=dict(polar=True))
ax.plot(angles, gold, color='gold', label='Gold')
ax.plot(angles, fiat, color='blue', label='Fiat')
ax.plot(angles, bitcoin, color='green', label='Bitcoin')

# 레이블 설정
ax.set_yticklabels([], fontproperties=font_prop)
ax.set_xticks(angles[:-1])
ax.set_xticklabels(labels, fontproperties=font_prop, color='red', weight='bold')

# 범례 추가
plt.legend(loc='upper right', bbox_to_anchor=(1.1, 1.1))

# 차트 제목
plt.title('금, 법정화폐, 비트코인 화폐 속성 비교', fontproperties=font_prop, fontsize=20)

# 차트 보여주기
plt.show()
